class User{
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