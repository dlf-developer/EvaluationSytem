class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = ["page", "sort", "limit", "fields", "search"];
    excludedFields.forEach((el) => delete queryObj[el]);

    // Advanced filtering handling (e.g., gte, gt, lte, lt)
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    const filterObj = JSON.parse(queryStr);

    // Search logic
    if (this.queryString.search) {
      // Need to know which fields to search on, can pass a regex to match multiple fields
      // Assuming we search across common fields. This can be customized per model via a searchFields passed or defined in the controller
      // For now, let's keep it generic by accepting a $or array from the controller explicitly or handling a default
    }

    this.query = this.query.find(filterObj);
    return this;
  }

  search(searchFields = []) {
    if (this.queryString.search && searchFields.length > 0) {
      const regex = new RegExp(this.queryString.search, "i");
      const searchOr = searchFields.map((field) => ({ [field]: regex }));
      this.query = this.query.find({ $or: searchOr });
    }
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(",").join(" ");
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("-createdAt");
    }
    return this;
  }

  paginate() {
    const page = parseInt(this.queryString.page, 10) || 1;
    const limit = parseInt(this.queryString.limit, 10) || 10;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}

module.exports = APIFeatures;
