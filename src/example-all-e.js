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
        this.log(`It is e, I immediately will accept at ${this.immediateAcceptThreshold}, will leap at round ${this.leapThreshold} for the amount of ${this.acceptSumAfterLeapThreshold}`);

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
        o = this.counts.slice();
        let v = this.values.slice();
        if (this.rounds == this.max_rounds - 1) { // ask for everything, maximize all in
            this.log(`I offer Maximize`);
            return o;
        } else if (this.rounds == this.max_rounds - 2) { // give you all items that value 0 for me, maximize rest
            this.log(`I offer Maximize, but you can get my zeroes`);
            for (let i = 0; i < o.length; i++) {
                if (!this.values[i])
                    o[i] = 0;
            }
            return o;
        } else if (this.rounds <= this.leapThreshold - 1) { // after leap, make offer for acceptSumAfterLeapThreshold (-1 because that is my turn offering)
            this.log(`I leaped in my offers round number, i offer the acceptSumAfterLeapThreshold`);
            //this.shuffleArray(o, v);
            let s = 0;
            for (let i = 0; i < o.length; i++) {
                s += this.values[i] * this.counts[i];
                if (s >= this.acceptSumAfterLeapThreshold) {
                    for (let j = i + 1; j < o.length; j++) // empty rest of the offer result array
                        o[i] = 0;
                    return o;
                }
            }
        } else { // make an offer no lower then the immediateAcceptThreshold
            this.log(`I offer no lower then the immediateAcceptThreshold`);
            //this.shuffleArray(o, v);
            let s = 0;
            for (let i = 0; i < o.length; i++) {
                s += this.values[i] * this.counts[i];
                if (s >= this.immediateAcceptThreshold) {
                    for (let j = i + 1; j < o.length; j++) // empty rest of the offer result array
                        o[i] = 0;
                    return o;
                }
            }
        }
        // ask for everything, maximize all in
        this.log(`return maximum`);
        return o;
    }
};