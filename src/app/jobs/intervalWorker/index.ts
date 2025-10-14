/*
 @params: delay = delay in seconds
 @params: worker = the Worker will run in interval
*/
class IntervalWorker {
    private delay: number;
    private worker: () => Promise<void>;
    private intervals: NodeJS.Timeout[] = [];

    constructor(delay: number, worker: () => Promise<void>) {
        this.delay = delay * 1000;
        this.worker = worker;
    }

    // Run the worker once
    async runOnce() {
        await this.worker();
    }

    // Start the worker
    start() {
        // Run the interval
        const interval = setInterval(this.worker, this.delay);
        this.intervals.push(interval);
    }

    // Stop the Worker
    stop() {
        this.intervals.forEach((interval) => {
            clearInterval(interval);
        });
        this.intervals = [];
    }
}

export default IntervalWorker;
