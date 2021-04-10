class Asset{

    /**
     * Permet la création d'une instance d'actif
     * 
     * @param {number} id The id of the asset
     * @param {number} type The type's id of the asset
     * @param {string} label The label of the asset
     * @param {string} ticker The ticker of the asset
     * @param {number} quantity The quantity of the asset
     * @param {number} unit_cost_price The unit cost price of the asset
     * @param {number} price_alert The price alert of the asset
     */
    constructor(id, type, label, ticker, quantity, unit_cost_price, price_alert){
        this.id = id;
        this.type = type;
        this.label = label;
        this.ticker = ticker;
        this.quantity = quantity;
        this.unit_cost_price = unit_cost_price;
        this.price_alert = price_alert;
    }
}

module.exports = Asset;