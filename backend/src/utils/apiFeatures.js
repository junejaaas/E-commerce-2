class APIFeatures {
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }

    filter() {
        const queryObj = { ...this.queryString };
        const excludedFields = ['page', 'sort', 'limit', 'fields', 'keyword', 'availability'];
        excludedFields.forEach((el) => delete queryObj[el]);

        // Handle flat operator format (e.g., ?price[gte]=5000) and nested format
        const intermediateObj = {};
        Object.keys(queryObj).forEach(key => {
            const match = key.match(/^(.+)\[(gte|gt|lte|lt)\]$/);
            if (match) {
                const field = match[1];
                const op = match[2];
                if (!intermediateObj[field]) intermediateObj[field] = {};
                intermediateObj[field][op] = queryObj[key];
            } else {
                intermediateObj[key] = queryObj[key];
            }
        });

        // Convert gt, gte, lt, lte to $gt, $gte, $lt, $lte
        let queryStr = JSON.stringify(intermediateObj);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
        
        let filterObj = JSON.parse(queryStr);

        // Convert string numbers to actual numbers for MongoDB queries
        Object.keys(filterObj).forEach(key => {
            if (typeof filterObj[key] === 'object' && filterObj[key] !== null) {
                Object.keys(filterObj[key]).forEach(op => {
                    if (typeof filterObj[key][op] === 'string' && !isNaN(filterObj[key][op])) {
                        filterObj[key][op] = Number(filterObj[key][op]);
                    }
                });
            } else if (typeof filterObj[key] === 'string' && !isNaN(filterObj[key]) && key !== 'category' && key !== 'brand' && key !== 'status') {
                filterObj[key] = Number(filterObj[key]);
            }
        });

        // Availability filter
        if (this.queryString.availability === 'true') {
            filterObj.stock = { $gt: 0 };
        }

        this.query = this.query.find(filterObj);

        // Keyword search
        if (this.queryString.keyword) {
            const keyword = this.queryString.keyword;
            this.query = this.query.find({
                $or: [
                    { name: { $regex: keyword, $options: 'i' } },
                    { brand: { $regex: keyword, $options: 'i' } }
                ]
            });
        }

        return this;
    }

    sort() {
        if (this.queryString.sort) {
            const sortBy = this.queryString.sort.split(',').join(' ');
            this.query = this.query.sort(sortBy);
        } else {
            this.query = this.query.sort('-createdAt');
        }

        return this;
    }

    limitFields() {
        if (this.queryString.fields) {
            const fields = this.queryString.fields.split(',').join(' ');
            this.query = this.query.select(fields);
        } else {
            this.query = this.query.select('-__v');
        }

        return this;
    }

    paginate() {
        const page = this.queryString.page * 1 || 1;
        const limit = this.queryString.limit * 1 || 100;
        const skip = (page - 1) * limit;

        this.query = this.query.skip(skip).limit(limit);

        return this;
    }
}

module.exports = APIFeatures;
