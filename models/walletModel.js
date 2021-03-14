class Wallet{
    constructor(id, type, label, creation_date, asset_list, user_id){
        this.id = id;
        this.type = type;
        this.label = label;
        this.creation_date = creation_date;
        this.asset_list = asset_list;
        this.user_id = user_id;
    }
}

module.exports = Wallet;