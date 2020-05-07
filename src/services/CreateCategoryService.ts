// import AppError from '../errors/AppError';

import { getRepository } from 'typeorm';
import Category from '../models/Category';

interface RequestDTO {
  title: string;
}

class CreateCategoryService {
  public async execute({ title }: RequestDTO): Promise<Category> {
    const categoryRepository = getRepository(Category);
    const category = await categoryRepository.findOne({ where: { title } });

    if (category) {
      return category;
    }

    const created_category = categoryRepository.create({ title });
    await categoryRepository.save(created_category);
    return created_category;
  }
}

export default CreateCategoryService;
