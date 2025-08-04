import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { StreaksModule } from './streaks/streaks.module';

@Module({
  imports: [StreaksModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
