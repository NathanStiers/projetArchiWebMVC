class Wallet{

    /**
     * Allows the creation of a wallet instance
     * 
     * @param {number} id The id of the wallet
     * @param {number} type The type's id of the wallet
     * @param {string} label The label of the wallet
     * @param {Date} creation_date The creation date of the wallet
     * @param {Array} asset_list The asset list of the wallet
     * @param {number} user_id The id of the user belonging the wallet
     */
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