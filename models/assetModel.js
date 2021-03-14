class Asset{
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