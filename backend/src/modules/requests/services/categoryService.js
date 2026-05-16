'use strict';

const CategoryRepository = require('../repositories/CategoryRepository');
const redisClient = require('../../../cache/redis');
const logger = require('../../../utils/logger');

const categoryService = {
  async getAllCategories() {
    const cached = await redisClient.getCachedCategories();
    if (cached) return cached;

    const categories = await CategoryRepository.findAll({ activeOnly: true });
    await redisClient.cacheCategories(categories);
    return categories;
  },

  async getCategoryById(id) {
    return CategoryRepository.findById(id);
  },

  async createCategory(data) {
    if (data.parentId) {
      const parent = await CategoryRepository.findById(data.parentId);
      if (!parent) return { error: 'PARENT_NOT_FOUND', message: 'Parent category not found' };
    }

    const category = await CategoryRepository.create({
      name: data.name,
      description: data.description || null,
      parentId: data.parentId || null,
      iconUrl: data.iconUrl || null,
      sortOrder: data.sortOrder || 0,
      isActive: data.isActive !== undefined ? data.isActive : true,
    });

    await redisClient.invalidateCategories();
    logger.info('Category created', { categoryId: category.id });
    return { category };
  },

  async updateCategory(id, data) {
    const existing = await CategoryRepository.findById(id);
    if (!existing) return { error: 'NOT_FOUND', message: 'Category not found' };

    const category = await CategoryRepository.update(id, data);
    await redisClient.invalidateCategories();
    return { category };
  },

  async deleteCategory(id) {
    const existing = await CategoryRepository.findById(id);
    if (!existing) return { error: 'NOT_FOUND', message: 'Category not found' };

    await CategoryRepository.delete(id);
    await redisClient.invalidateCategories();
    return { success: true };
  },
};

module.exports = categoryService;
