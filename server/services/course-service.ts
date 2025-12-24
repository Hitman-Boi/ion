import { prisma } from "@/lib/prisma";
import { CourseBlock } from "@prisma/client";

export const CourseService = {
    /**
     * Fetches the entire course structure as a flat list, ordered by the ltree path.
     * This allows the frontend to easily reconstruct the tree or render a flattened list.
     */
    async getCourseStructure(courseId: string): Promise<CourseBlock[]> {
        // We use raw SQL because Prisma doesn't fully support ltree sorting/filtering in the typed API yet.
        // The '::uuid' cast is important for PostgreSQL strict typing.
        return await prisma.$queryRaw<CourseBlock[]>`
      SELECT * FROM "course_blocks"
      WHERE "course_id" = ${courseId}::uuid
      ORDER BY "path" ASC;
    `;
    },

    /**
   * Moves a block to a new parent and/or new position among siblings.
   * Performs a transactional update to ensure the ltree path consistency.
   */
    async moveBlock(blockId: string, newParentId: string | null, newIndex: number) {
        return await prisma.$transaction(async (tx) => {
            const block = await tx.courseBlock.findUniqueOrThrow({ where: { id: blockId } });
            const oldPath = block.path;

            // 1. Determine new path prefix
            let newPathPrefix = "";
            if (newParentId) {
                const parent = await tx.courseBlock.findUniqueOrThrow({ where: { id: newParentId } });
                newPathPrefix = parent.path;
            }

            // ltree labels cannot contain hyphens, so we replace UUID hyphens with underscores
            const sanitizedId = blockId.replace(/-/g, '_');
            const newPath = newPathPrefix ? `${newPathPrefix}.${sanitizedId}` : sanitizedId;

            // 2. Update descendants paths (Re-parenting the subtree)
            // We use raw SQL to update all children efficiently using ltree functions.
            // Logic: NewPath + Subpath(OldPath, Level(OldPath))
            if (oldPath !== newPath) {
                await tx.$executeRaw`
          UPDATE "course_blocks"
          SET "path" = ${newPath}::ltree || subpath("path", nlevel(${oldPath}::ltree))
          WHERE "path" <@ ${oldPath}::ltree AND "id" != ${blockId}::uuid
        `;
            }

            // 3. Shift siblings at the new destination to make room
            // We only need to shift if we are inserting into a specific index
            await tx.courseBlock.updateMany({
                where: {
                    parentId: newParentId,
                    position: { gte: newIndex },
                    id: { not: blockId } // Don't shift self if we are already there (edge case)
                },
                data: { position: { increment: 1 } }
            });

            // 4. Update the block itself
            const updatedBlock = await tx.courseBlock.update({
                where: { id: blockId },
                data: {
                    parentId: newParentId,
                    path: newPath,
                    position: newIndex
                }
            });

            return updatedBlock;
        });
    }
};
