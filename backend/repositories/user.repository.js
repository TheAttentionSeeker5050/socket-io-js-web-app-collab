// make the model methods available to the server
// this is to restrict the server from directly accessing the database
// something like a repository pattern

const User = require('../schema/user.schema');
// const { Op } = require('sequelize');


// the repository pattern is used to restrict the server from directly accessing the database
// this is to make the code more modular and easier to maintain
const UserRepository = new class {
    async createUser(user) {        

        const userPayloadObject = {
            "username": user.username,
            "email": user.email,
            "passwordHash": user.passwordHash,
            "bio": user.bio || "blabla",
            "profilePicture": user.profilePicture || "blabla",
            "dateCreated": new Date(),
            "dateUpdated": new Date()
        };
        
        
        const result = await User.create(userPayloadObject);


        return result;
    }
    async getUserById(id) {
        // if user is not found, throw error
        if (!id) {
            throw new Error('User id is empty');
        }

        const user = await User.findByPk(id);
        if (!user) {
            throw new Error('User not found');
        }

        return user;
    }
    async getUserByEmail(email) {
        // if email is empty, throw error
        if (!email) {
            throw new Error('User email is empty');
        }
        
        // if user is not found, throw error
        const user = await User.findOne({ where: { email } });

        return user;
    }
    async getUserByUsername(username) {
        // if username is empty, throw error
        if (!username) {
            throw new Error('User username is empty');
        }

        const user = await User.findOne({ where: { username } });
        
        return user;
    }
    async updateUser(user) {
        // if user data is empty, throw error
        if (!user) {
            throw new Error('User data is empty');
        }

        // if user id is empty, throw error
        if (!user.id) {
            throw new Error('User id is empty');
        }

        // update user data
        return await User.update(user, { where: { id: user.id } });
    }
    async deleteUser(id) {
        // if user id is empty, throw error
        if (!id) {
            throw new Error('User id is empty');
        }

        // delete user
        return await User.destroy({ where: { id } });
    }

    async getUserList() {
        return await User.findAll();
    }

    // find user whose email or username includes the search term
    async searchUserByTerm(searchTerm) {
        // if search term is empty, throw error
        if (!searchTerm) {
            throw new Error('Search term is empty');
        }

        return await User.findAll({
            where: {
                // Op is a sequelize operator, Op.or is used make the search on either username or email and display the results combined
                [Op.or]: [
                    // Op.like is used to compare if the search term is included in the username or email
                    { username: { [Op.like]: `%${searchTerm}%` } },
                    { email: { [Op.like]: `%${searchTerm}%` } }
                ]
            }
        });
    }
}

module.exports = UserRepository;