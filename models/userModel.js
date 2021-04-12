class User{

    /**
     * Allows the creation of a user instance
     * 
     * @param {number} id The id of the user
     * @param {number} role The role's id of the user
     * @param {string} name The name of the user
     * @param {string} surname The surname of the user
     * @param {string} mail The mail of the user
     * @param {string} password The password of the user
     * @param {Array} wallet_list The wallet list of the user
     */
    constructor(id, role, name, surname, mail, password, wallet_list){
        this.id = id;
        this.role = role;
        this.name = name;
        this.surname = surname;
        this.mail = mail;
        this.password = password;
        this.wallet_list = wallet_list;
    }
}

module.exports = User;