class ApiFilters {
    constructor(query, querystr) {
        this.query = query; // Product-Model where search will happen
        this.querystr = querystr; // req.query Object, which contains all the keywords in key =value form
    }

    search() {
        const keyword = this.querystr.keyword ? {
            name: {
                $regex: this.querystr.keyword,
                $options: "i"
            },
        } : {}
        this.query = this.query.find({ ...keyword })
        return this;

    }

    filters() {
        const queryCopy = { ...this.querystr }
        // console.log(queryCopy)
        const feildsToRemove = ['keyword', "page"]
        feildsToRemove.forEach((el) => delete queryCopy[el])
        // console.log(queryCopy)

        let queryStr = JSON.stringify(queryCopy)
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (match) => `$${match}`)
        // console.log(queryStr)

        this.query = this.query.find(JSON.parse(queryStr)) //Yaha (queryCopy) ki jgh video mei queryStr likha hua hai but it was not working for me
        return this;

    }

    pagination(resPerPage) {
        const current_Page = Number(this.querystr.page) || 1;
        const skip = resPerPage * (current_Page - 1);
        this.query = this.query.limit(resPerPage).skip(skip)
        return this;

    }
}

module.exports = ApiFilters