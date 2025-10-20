import ApiError from "../errors/ApiErrors";
import httpStatus from "http-status";

interface GetMaxSequenceParams {
    model: any;
    filter: Record<string, any>;
    target?: string;
    next?: boolean;
}

/**
 * Get the max (sortable) value from a model's field.
 * Example: getMaxSequence({ model: prisma.model, target: 'order', next: true })
 */
export async function getMaxSequence({
    model,
    filter = {},
    target = "id",
    next = false,
}: GetMaxSequenceParams): Promise<number | null> {
    const record = await model.findFirst({
        where: { ...filter },
        orderBy: { [target]: "desc" },
        select: { [target]: true },
    });

    const currentMax = record?.[target] ?? 0;
    return next ? currentMax + 1 : currentMax;
}

export const slugify = (filename: string): string => {
    return filename
        .toLowerCase()
        .replace(/ /g, "-")
        .replace(/[^\w-]+/g, "")
        .replace(/-+/g, "-")
        .replace(/^-+|-+$/g, "");
};

// Get Id from params, check if is Number, if not, throw error, return the id as a number
export const getValidatedIntId = (idParam: string): number => {
    const id = Number(idParam);

    if (isNaN(id)) {
        throw new ApiError(httpStatus.NOT_FOUND, "Item not Found!");
    }
    return id;
};
