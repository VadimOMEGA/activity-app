import { Module } from '@nestjs/common'
import { FestivalSectionsService } from './festival-sections.service'
import { FestivalSectionsController } from './festival-sections.controller'
import { PrismaService } from 'src/prisma.service'

@Module({
	controllers: [FestivalSectionsController],
	providers: [FestivalSectionsService, PrismaService]
})
export class FestivalSectionsModule {}
