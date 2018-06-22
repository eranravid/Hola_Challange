'use strict'; /*jslint node:true*/

module.exports = class Agent {
    constructor(me, counts, values, max_rounds, log) {
        this.counts = counts;
        this.values = values;
        this.rounds = max_rounds;
        this.max_rounds = max_rounds;
        this.log = log;
        this.total = 0;
        for (let i = 0; i < counts.length; i++)
            this.total += counts[i] * values[i];

        this.bestSumOffer = 0;
        this.immediateAcceptThreshold = this.total * (1 - 0.2718);
        this.leapThreshold = Math.ceil(this.max_rounds * 0.36787944117);
        this.acceptSumAfterLeapThreshold = this.total / 2;
        this.log(`It is I, I immediately will accept at ${this.immediateAcceptThreshold}, will leap at round ${this.leapThreshold} for the amount of ${this.acceptSumAfterLeapThreshold}`);

        this.offersGraph = [];
        this.passOffers = [];
        this.buildOfferGraph();

    }
    offer(o) {
        this.log(`${this.rounds} rounds left`);
        this.rounds--;
        // should I accept? -- optimal stop solution (1/e)
        if (o) {
            let sum = 0;
            for (let i = 0; i < o.length; i++)
                sum += this.values[i] * o[i];
            this.log(`The counter offer sum is ${sum}, the best offer yet is ${this.bestSumOffer}`);
            if (sum >= this.immediateAcceptThreshold) { // if the sum offered is greater then a threshold, agree
                this.log(`I accept, for ${sum} is greater or equal to my immediateAcceptThreshold at ${this.immediateAcceptThreshold}`);
                return;
            }
            if (this.rounds <= this.leapThreshold) // if the current amount of rounds is greater then the leap threshold which is 1/e of the total rounds amount
                if (sum >= this.bestSumOffer && sum >= this.acceptSumAfterLeapThreshold) { // accept only if the sum is greater or equal then the accepted threshold after leap
                    this.log(`I accept, for I already leaped and ${sum} is greater or equal to the best offer and my acceptSumAfterLeapThreshold at ${this.acceptSumAfterLeapThreshold}`);
                    return;
                }
            this.bestSumOffer = sum > this.bestSumOffer ? sum : this.bestSumOffer; // update best offer sum
        }
        // make an offer -- give minimum items, maximize own items value, make the counter side to make a good counter offer.
        o = this.offersGraph.shift();
        this.log(`This is my I offer`);
        return o.sum >= this.acceptSumAfterLeapThreshold ? o.myItems : -1;
    }
    // make offer based of the values with minimum sum and no repeating offers (if possible)
    makeOffer(min) {

    }
    buildOfferGraph() {
        this.log(`counts: ${JSON.stringify(this.counts)}`);
        this.log(`values: ${JSON.stringify(this.values)}`);
        let mi = []; // my items
        let ci = []; // counter items
        // for (let i = 0; i < this.counts.length; i++) {
        let n = 0;
        for (let j = 0; j <= this.counts[0]; j++) {
            for (let k = 0; k <= this.counts[1]; k++) {
                for (let q = 0; q <= this.counts[2]; q++) {
                    mi = [j, k, q];
                    ci = [this.counts[0] - j, this.counts[1] - k, this.counts[2] - q];
                    this.offersGraph.push(new Offer(n, mi, ci, this.values));
                    n++
                }
            }
        }
        this.offersGraph.sort((a, b) => {
            return b.sum - a.sum;
        });
        for (let o in this.offersGraph) {
            this.log(`graph: ${this.offersGraph[o].print()}`);
        }
        // }
    }
};

class Offer {
    constructor(id, myItems, counterItems, values) {
        this.id = id;
        this.values = values;
        this.myItems = myItems;
        this.counterItems = counterItems;
        this.calcSum();
        this.calcNumOfItems();
    }
    calcSum() {
        this.sum = 0;
        for (let i = 0; i < this.values.length; i++) {
            this.sum += this.values[i] * this.myItems[i];
        }
    }
    calcNumOfItems() {
        this.numOfCounterItems = 0;
        for (let i = 0; i < this.counterItems.length; i++) {
            this.numOfCounterItems += this.counterItems[i];
        }
    }
    print() {
        return `offer #${this.id} sum: ${this.sum} myitems: ${JSON.stringify(this.myItems)} numOfCounterItems: ${this.numOfCounterItems} counteritems: ${JSON.stringify(this.counterItems)}`;
    }
}