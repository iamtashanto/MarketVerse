import { Router } from "express";
import { ProductsController } from "@/modules/products/products.controller";
import { ProductsService } from "@/modules/products/products.service";
import { ProductsRepository } from "@/modules/products/products.repository";
import { prismaRead } from "@/lib/prisma";
import { validate } from "@/middlewares/validate.middleware";
import { standardReadLimiter } from "@/middlewares/rateLimiter.middleware";
import { getProductSchema, listProductsSchema } from "@/modules/products/products.validation";

const productsRepository = new ProductsRepository(prismaRead);
const productsService = new ProductsService(productsRepository);
const productsController = new ProductsController(productsService);

export const productsRouter = Router();

productsRouter.get("/", standardReadLimiter, validate(listProductsSchema), productsController.listProducts);
productsRouter.get("/:productId", standardReadLimiter, validate(getProductSchema), productsController.getProduct);
