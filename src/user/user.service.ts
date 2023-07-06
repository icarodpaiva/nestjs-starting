import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDTO } from './dto/create-user.dto';
import { UpdatePutUserDTO } from './dto/update-put-user.dto';
import { UpdatePatchUserDTO } from './dto/update-patch-user.dto';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async exists(id: number) {
    if (!(await this.readOne(id))) {
      throw new NotFoundException(`O usuário ${id} não existe`);
    }
  }

  async create(data: CreateUserDTO) {
    return this.prisma.user.create({ data });
  }

  async read() {
    return this.prisma.user.findMany();
  }

  async readOne(id: number) {
    await this.exists(id);

    return this.prisma.user.findUnique({ where: { id } });
  }

  async update(id: number, data: UpdatePutUserDTO) {
    await this.exists(id);

    return this.prisma.user.update({
      where: { id },
      data: { ...data, birthAt: data.birthAt ? new Date(data.birthAt) : null },
    });
  }

  async updatePartial(id: number, data: UpdatePatchUserDTO) {
    await this.exists(id);

    if (data.birthAt) {
      data.birthAt = new Date(data.birthAt) as unknown as string;
    }

    return this.prisma.user.update({ where: { id }, data });
  }

  async delete(id: number) {
    await this.exists(id);

    return this.prisma.user.delete({ where: { id } });
  }
}
