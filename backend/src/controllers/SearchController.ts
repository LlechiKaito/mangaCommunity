// SearchController.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();


export const searchByTitle = async (title: string) => {
    return {
        title: {
            contains: title,
        },
    };
};

export const searchByTags = async (tag_names: string | string[]) => {
    const tagsArray = Array.isArray(tag_names) ? tag_names : tag_names.split(',');
    const tagIds = await prisma.tag.findMany({
        where: {
            tag_name: { in: tagsArray },
        },
        select: { id: true },
    });

    const tagIdsArray = tagIds.map(tag => tag.id);

    if (tagIdsArray.length > 0) {
        return {
            AND: tagIdsArray.map(tagId => ({
                work_tags: {
                    some: {
                        tag_id: tagId,
                    },
                },
            })),
        };
    }

    return {};
};
