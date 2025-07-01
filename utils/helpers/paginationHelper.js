// backend/src/utils/helpers/paginationHelper.js

/**
 * @desc Generates pagination metadata for API responses.
 * @param {number} totalCount - The total number of items available.
 * @param {number} currentPage - The current page number (1-indexed).
 * @param {number} limit - The number of items per page.
 * @returns {object} An object containing pagination details.
 */
exports.generatePaginationMetadata = (totalCount, currentPage, limit) => {
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = currentPage < totalPages;
    const hasPrevPage = currentPage > 1;

    return {
        totalItems: totalCount,
        totalPages: totalPages,
        currentPage: currentPage,
        itemsPerPage: limit,
        hasNextPage: hasNextPage,
        hasPrevPage: hasPrevPage,
        nextPage: hasNextPage ? currentPage + 1 : null,
        prevPage: hasPrevPage ? currentPage - 1 : null,
        firstItemIndex: totalCount === 0 ? 0 : (currentPage - 1) * limit + 1,
        lastItemIndex: Math.min(currentPage * limit, totalCount)
    };
};

/**
 * @desc Creates options object for Mongoose queries based on pagination and sorting.
 * @param {object} queryParams - The query parameters from the request (e.g., req.query).
 * @param {string} [defaultSort='createdAt:desc'] - The default sort order if none is provided.
 * @returns {object} An object with { skip, limit, sort }.
 */
exports.getPaginationAndSortOptions = (queryParams, defaultSort = 'createdAt:desc') => {
    const page = parseInt(queryParams.page) > 0 ? parseInt(queryParams.page) : 1;
    const limit = parseInt(queryParams.limit) > 0 && parseInt(queryParams.limit) <= 100 ? parseInt(queryParams.limit) : 10; // Max limit 100
    const skip = (page - 1) * limit;

    let sort = {};
    if (queryParams.sortBy) {
        const [field, order] = queryParams.sortBy.split(':');
        sort[field] = order === 'desc' ? -1 : 1;
    } else {
        const [field, order] = defaultSort.split(':');
        sort[field] = order === 'desc' ? -1 : 1;
    }

    return { skip, limit, sort, page };
};

// Example usage in a Mongoose query:
// const { skip, limit, sort, page } = getPaginationAndSortOptions(req.query);
// const items = await YourModel.find(filters).sort(sort).skip(skip).limit(limit);
// const totalCount = await YourModel.countDocuments(filters);
// const pagination = generatePaginationMetadata(totalCount, page, limit);