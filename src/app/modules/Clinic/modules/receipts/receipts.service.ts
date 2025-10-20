import prisma from "../../../../../shared/prisma";
import QueryBuilder from "../../../../../utils/queryBuilder";
import { ProductType, Invoice } from "@prisma/client";
import { JwtPayload } from "jsonwebtoken";

import ApiError from "../../../../../errors/ApiErrors";
import httpStatus from "http-status";
import { CreateReceiptInput } from "./receipts.validation";
import { getMaxSequence } from "../../../../../utils";

// Create Receipt
const createReceipt = async (payload: CreateReceiptInput, user: JwtPayload) => {
    const response = await prisma.invoice.create({
        data: {
            ...payload,
            id:
                (await getMaxSequence({
                    model: prisma.invoice,
                    filter: { clinicId: user.clinicId },
                    next: true,
                })) ?? 0,
            clinicId: user.clinicId,
            products: {
                createMany: {
                    data: payload.products.map((product) => {
                        const data: any = {
                            type: product.type,
                            quantity: product.quantity,
                        };

                        switch (product.type) {
                            case "BOND":
                                data["bondId"] = product.id;
                                break;
                            case "SERVICE":
                                data["serviceId"] = product.id;
                                break;
                            case "VOUCHER":
                                data["voucherId"] = product.id;
                                break;
                            case "OTHER":
                                data["otherId"] = product.id;
                                break;
                        }

                        return data;
                    }),
                },
            },
        },
    });

    return {
        message: "Receipt Created",
        data: {
            id: response.id,
        },
    };
};

// Get Receipts
const getReceipts = async (query: Record<string, any>, user: JwtPayload) => {
    const queryBuilder = new QueryBuilder(prisma.invoice, query);

    const receipts: (Invoice & {
        patient: {
            firstName: string;
            lastName: string;
            email: string;
        };
        products: {
            type: ProductType;
            service: {
                name: string;
            };
        }[];
    })[] = await queryBuilder
        .sort()
        .paginate()
        .rawFilter({
            clinicId: user.clinicId,
        })
        .include({
            patient: {
                select: {
                    firstName: true,
                    lastName: true,
                    email: true,
                },
            },
            products: {
                select: {
                    type: true,
                    service: {
                        select: {
                            name: true,
                        },
                    },
                },
            },
        })
        .execute();

    const pagination = await queryBuilder.countTotal();

    const formattedData = receipts.map((receipt) => {
        const data = {
            id: receipt.id,
            patient: { ...receipt.patient },
            product: receipt.products[0]?.service?.name,
            type: receipt.products[0]?.type,

            total: receipt.total,
            paid: receipt.paid,
            due: receipt.total - receipt.paid,
        };

        return data;
    });

    return {
        message: "Receipts parsed",
        data: formattedData,
        pagination,
    };
};

// Get Receipt Details by Id
const getReceiptDetailsById = async (id: number, user: JwtPayload) => {
    const receipt = await prisma.invoice.findUnique({
        where: {
            id_clinicId: {
                id: id,
                clinicId: user.clinicId,
            },
        },
        include: {
            clinic: {
                select: {
                    address1: true,
                    address2: true,
                    phone: true,
                    email: true,
                    name: true,
                    branding: true,
                },
            },
            patient: true,
            products: {
                include: {
                    bond: true,
                    service: true,
                    voucher: true,
                },
            },
        },
    });

    if (!receipt) {
        throw new ApiError(httpStatus.NOT_FOUND, "Receipt not Found!");
    }

    const formattedData = {
        id: receipt.id,
        patient: {
            id: receipt.patient.id,
            firstName: receipt.patient.firstName,
            lastName: receipt.patient.lastName,
            phone: receipt.patient.phone,
            email: receipt.patient.email,
        },
        branding: receipt.clinic.branding
            ? {
                  ...receipt.clinic.branding,
                  address1: receipt.clinic.address1,
                  address2: receipt.clinic.address2,
                  phone: receipt.clinic.phone,
              }
            : {
                  name: receipt.clinic.name,
                  phone: receipt.clinic.phone,
                  email: receipt.clinic.email,
                  address1: receipt.clinic.address1,
                  address2: receipt.clinic.address2,
              },
        products: receipt.products.map((product) => {
            const data: {
                type: typeof product.type;
                quantity: number;
                name: string | null;
                price: number | null;
                total: number | null;
            } = {
                type: product.type,
                quantity: product.quantity,
                name: null,
                price: null,
                total: null,
            };
            switch (product.type) {
                case "BOND":
                    data["name"] = product.bond?.name!;
                    data["price"] = product.bond?.price!;
                    data["total"] = product.bond?.price! * product.quantity;
                    break;
                case "SERVICE":
                    data["name"] = product.service?.name!;
                    data["price"] = product.service?.price!;
                    data["total"] = product.service?.price! * product.quantity;
                    break;
                case "VOUCHER":
                    data["name"] = product.voucher?.name!;
                    data["price"] = product.voucher?.price!;
                    data["total"] = product.voucher?.price! * product.quantity;
                    break;
                case "OTHER":
                    break;
            }
            return data;
        }),
        tax: receipt.tax,
        discount: receipt.discount,
        paid: receipt.paid,
        subTotal: receipt.subTotal,
        total: receipt.total,
    };
    // (formattedData as any)["subTotal"] = formattedData.products
    //     .filter((p) => p.type === "SERVICE")
    //     .reduce((p, c) => p + c.price! * c.quantity, 0);
    // (formattedData as any)["total"] = applyTaxAndDiscount(
    //     (formattedData as any).subTotal,
    //     formattedData.tax,
    //     formattedData.discount
    // );

    return {
        message: "Receipt Data parsed",
        data: formattedData,
    };
};

// Delete Receipt
const deleteReceipt = async (id: number, user: JwtPayload) => {
    const response = await prisma.invoice.delete({
        where: {
            id_clinicId: {
                id: id,
                clinicId: user.clinicId,
            },
        },
        select: {
            id: true,
        },
    });

    return {
        message: "Recept Deleted successfully",
        data: {
            id: response.id,
        },
    };
};

export default {
    createReceipt,
    getReceipts,
    getReceiptDetailsById,
    deleteReceipt,
};
