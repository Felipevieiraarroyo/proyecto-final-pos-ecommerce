import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.js";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  console.log("🌱 Iniciando seed...");

  // =========================
  // 1. USUÁRIOS
  // =========================

  const adminPassword = await bcrypt.hash("Admin123!", 10);
  const cajeroPassword = await bcrypt.hash("Cajero123!", 10);
  const clientePassword = await bcrypt.hash("Cliente123!", 10);

  const admin = await prisma.user.upsert({
    where: {
      email: "admin@proyectofinal.com",
    },
    update: {},
    create: {
      name: "Administrador",
      email: "admin@proyectofinal.com",
      password: adminPassword,
      role: "ADMIN",
    },
  });

  const cajero = await prisma.user.upsert({
    where: {
      email: "cajero@proyectofinal.com",
    },
    update: {},
    create: {
      name: "Cajero Principal",
      email: "cajero@proyectofinal.com",
      password: cajeroPassword,
      role: "CAJERO",
    },
  });

  const clienteUser = await prisma.user.upsert({
    where: {
      email: "cliente@proyectofinal.com",
    },
    update: {},
    create: {
      name: "Cliente Demo",
      email: "cliente@proyectofinal.com",
      password: clientePassword,
      role: "CLIENTE",
    },
  });

  // =========================
  // 2. CLIENTE
  // =========================

  const cliente = await prisma.customer.upsert({
    where: {
      userId: clienteUser.id,
    },
    update: {},
    create: {
      userId: clienteUser.id,
      phone: "11999999999",
      document: "12345678900",
    },
  });

  // =========================
  // 3. CATEGORÍAS
  // =========================

  let electronicos = await prisma.category.findFirst({
    where: {
      name: "Eletrônicos",
    },
  });

  if (!electronicos) {
    electronicos = await prisma.category.create({
      data: {
        name: "Eletrônicos",
        description: "Produtos eletrônicos e dispositivos.",
      },
    });
  }

  let acessorios = await prisma.category.findFirst({
    where: {
      name: "Acessórios",
    },
  });

  if (!acessorios) {
    acessorios = await prisma.category.create({
      data: {
        name: "Acessórios",
        description: "Acessórios para dispositivos eletrônicos.",
      },
    });
  }

  // =========================
  // 4. PRODUTOS + INVENTÁRIO
  // =========================

  const produtos = [
    {
      name: "Teclado Mecânico",
      description: "Teclado mecânico para computador.",
      acquisitionPrice: 120,
      salePrice: 199.9,
      categoryId: electronicos.id,
      quantity: 15,
    },
    {
      name: "Mouse Gamer",
      description: "Mouse óptico para jogos.",
      acquisitionPrice: 70,
      salePrice: 119.9,
      categoryId: electronicos.id,
      quantity: 20,
    },
    {
      name: "Headset",
      description: "Headset com microfone integrado.",
      acquisitionPrice: 90,
      salePrice: 159.9,
      categoryId: electronicos.id,
      quantity: 10,
    },
    {
      name: "Mousepad",
      description: "Mousepad de superfície grande.",
      acquisitionPrice: 25,
      salePrice: 49.9,
      categoryId: acessorios.id,
      quantity: 30,
    },
    {
      name: "Cabo USB-C",
      description: "Cabo USB-C para carregamento e dados.",
      acquisitionPrice: 15,
      salePrice: 29.9,
      categoryId: acessorios.id,
      quantity: 50,
    },
  ];

  for (const produto of produtos) {
    let product = await prisma.product.findFirst({
      where: {
        name: produto.name,
        categoryId: produto.categoryId,
      },
    });

    if (!product) {
      product = await prisma.product.create({
        data: {
          name: produto.name,
          description: produto.description,
          acquisitionPrice: produto.acquisitionPrice,
          salePrice: produto.salePrice,
          categoryId: produto.categoryId,
        },
      });
    }

    const inventory = await prisma.inventory.findUnique({
      where: {
        productId: product.id,
      },
    });

    if (!inventory) {
      await prisma.inventory.create({
        data: {
          productId: product.id,
          quantity: produto.quantity,
        },
      });
    }
  }

  // =========================
  // 5. CAIXA
  // =========================

  const caixaExistente = await prisma.cashRegister.findFirst({
    where: {
      userId: cajero.id,
      status: "OPEN",
    },
  });

  const caixa =
    caixaExistente ??
    (await prisma.cashRegister.create({
      data: {
        userId: cajero.id,
        openingAmount: 100,
        openedAt: new Date(),
        status: "OPEN",
      },
    }));

  // =========================
  // 6. PRODUTOS DA VENDA
  // =========================

  const teclado = await prisma.product.findFirst({
    where: {
      name: "Teclado Mecânico",
    },
  });

  const mouse = await prisma.product.findFirst({
    where: {
      name: "Mouse Gamer",
    },
  });

  if (!teclado || !mouse) {
    throw new Error("Produtos da venda não encontrados.");
  }

  // =========================
  // 7. VENDA
  // =========================

  const vendaExistente = await prisma.sale.findFirst({
    where: {
      cashRegisterId: caixa.id,
    },
  });

  if (!vendaExistente) {
    const quantidadeTeclado = 1;
    const quantidadeMouse = 2;

    const subtotalTeclado =
      Number(teclado.salePrice) * quantidadeTeclado;

    const subtotalMouse =
      Number(mouse.salePrice) * quantidadeMouse;

    const total =
      subtotalTeclado + subtotalMouse;

    const venda = await prisma.sale.create({
      data: {
        cashRegisterId: caixa.id,
        total,

        items: {
          create: [
            {
              productId: teclado.id,
              quantity: quantidadeTeclado,
              unitPrice: teclado.salePrice,
              subtotal: subtotalTeclado,
            },
            {
              productId: mouse.id,
              quantity: quantidadeMouse,
              unitPrice: mouse.salePrice,
              subtotal: subtotalMouse,
            },
          ],
        },

        payments: {
          create: {
            amount: total,
            method: "PIX",
            status: "COMPLETO",
          },
        },
      },
    });

    console.log(`🧾 Venda criada: #${venda.id}`);
    console.log(`💵 Total da venda: R$ ${total.toFixed(2)}`);
  }
    // =========================
  // 8. ENDEREÇO DO CLIENTE
  // =========================

  let endereco = await prisma.address.findFirst({
    where: {
      customerId: cliente.id,
    },
  });

  if (!endereco) {
    endereco = await prisma.address.create({
      data: {
        customerId: cliente.id,
        street: "Rua das Flores",
        number: "123",
        complement: "Apartamento 42",
        city: "Santo André",
        reference: "Próximo ao centro",
      },
    });
  }

  // =========================
  // 9. CARRINHO DO CLIENTE
  // =========================

  let carrinho = await prisma.cart.findUnique({
    where: {
      customerId: cliente.id,
    },
  });

  if (!carrinho) {
    carrinho = await prisma.cart.create({
      data: {
        customerId: cliente.id,
      },
    });
  }

  // =========================
  // 10. ITENS DO CARRINHO
  // =========================

  const mousepad = await prisma.product.findFirst({
    where: {
      name: "Mousepad",
    },
  });

  if (!mousepad) {
    throw new Error("Mousepad não encontrado.");
  }

  const itemTeclado = await prisma.cartItem.findFirst({
    where: {
      cartId: carrinho.id,
      productId: teclado.id,
    },
  });

  if (!itemTeclado) {
    await prisma.cartItem.create({
      data: {
        cartId: carrinho.id,
        productId: teclado.id,
        quantity: 1,
      },
    });
  }

  const itemMousepad = await prisma.cartItem.findFirst({
    where: {
      cartId: carrinho.id,
      productId: mousepad.id,
    },
  });

  if (!itemMousepad) {
    await prisma.cartItem.create({
      data: {
        cartId: carrinho.id,
        productId: mousepad.id,
        quantity: 2,
      },
    });
  }

    // =========================
   // 11. PEDIDO E-COMMERCE
  // =========================

  const enderecoPedido = await prisma.address.findFirst({
    where: {
      customerId: cliente.id,
    },
  });

  if (!enderecoPedido) {
    throw new Error("Endereço do cliente não encontrado.");
  }
  const carrinhoPedido = await prisma.cart.findUnique({
    where: {
      customerId: cliente.id,
    },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  if (!carrinhoPedido || carrinhoPedido.items.length === 0) {
    throw new Error("Carrinho vazio ou não encontrado.");
  }
    const itensPedido = carrinhoPedido.items.map((item) => {
    const unitPrice = Number(item.product.salePrice);
    const subtotal = unitPrice * item.quantity;

    return {
      productId: item.productId,
      quantity: item.quantity,
      unitPrice,
      subtotal,
    };
  });

  const totalPedido = itensPedido.reduce(
    (total, item) => total + item.subtotal,
    0,
  );
    const pedidoExistente = await prisma.order.findFirst({
    where: {
      customerId: cliente.id,
      source: "WEB",
    },
  });

  if (!pedidoExistente) {
    const pedido = await prisma.order.create({
      data: {
        customerId: cliente.id,
        source: "WEB",
        status: "PENDIENTE",
        total: totalPedido,

        shippingStreet: enderecoPedido.street,
        shippingNumber: enderecoPedido.number,
        shippingComplement: enderecoPedido.complement,
        shippingCity: enderecoPedido.city,
        shippingReference: enderecoPedido.reference,

        items: {
          create: itensPedido,
        },

        payments: {
          create: {
            amount: totalPedido,
            method: "PIX",
            status: "PENDIENTE",
          },
        },
      },
    });

    console.log(`🛍️ Pedido criado: #${pedido.id}`);
    console.log(
      `💰 Total do pedido: R$ ${totalPedido.toFixed(2)}`,
    );
  }
   // =========================
  // 12. PEDIDOS DE LOGÍSTICA
 // =========================

  const pedidosLogistica = [
    {
      source: "WEB" as const,
      status: "PAGO" as const,
      quantity: 1,
      productId: teclado.id,
    },
    {
      source: "WEB" as const,
      status: "EN_CAMINO" as const,
      quantity: 1,
      productId: mouse.id,
    },
    {
      source: "SOCIAL" as const,
      status: "ENTREGADO" as const,
      quantity: 2,
      productId: mousepad.id,
    },
    {
      source: "SOCIAL" as const,
      status: "CANCELADO" as const,
      quantity: 1,
      productId: mouse.id,
    },
  ];

  for (const dados of pedidosLogistica) {
    const pedidoExistente = await prisma.order.findFirst({
      where: {
        customerId: cliente.id,
        source: dados.source,
        status: dados.status,
      },
    });

    if (pedidoExistente) {
      continue;
    }

    const product = await prisma.product.findUnique({
      where: {
        id: dados.productId,
      },
    });

    if (!product) {
      throw new Error(
        `Produto ${dados.productId} não encontrado.`,
      );
    }

    const unitPrice = Number(product.salePrice);
    const subtotal = unitPrice * dados.quantity;

    await prisma.order.create({
      data: {
        customerId: cliente.id,
        source: dados.source,
        status: dados.status,
        total: subtotal,

        shippingStreet: enderecoPedido.street,
        shippingNumber: enderecoPedido.number,
        shippingComplement: enderecoPedido.complement,
        shippingCity: enderecoPedido.city,
        shippingReference: enderecoPedido.reference,

        items: {
          create: {
            productId: product.id,
            quantity: dados.quantity,
            unitPrice,
            subtotal,
          },
        },

        payments: {
          create: {
            amount: subtotal,
            method: "PIX",
            status:
              dados.status === "CANCELADO"
                ? "CANCELADO"
                : "COMPLETO",
          },
        },
      },
    });

    console.log(
      `📦 Pedido ${dados.source} → ${dados.status}`,
    );
  }

  console.log(`📍 Endereço criado/encontrado: #${endereco.id}`);
  console.log(`🛒 Carrinho criado/encontrado: #${carrinho.id}`);
  console.log("✅ Seed concluído!");
  console.log(`👤 Admin: ${admin.email}`);
  console.log(`💰 Cajero: ${cajero.email}`);
  console.log(`🛒 Cliente: ${clienteUser.email}`);
  console.log(`📦 Cliente ID: ${cliente.id}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });