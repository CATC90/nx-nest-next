import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { HttpModule } from '@nestjs/axios';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import mongooseConfig from './config/mongoose.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [mongooseConfig],
      isGlobal: true,
    }),
    {
      global: true,
      ...HttpModule.register({}),
    },
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        console.log(configService.get<string>('DB_URI'));
        return {
          uri: configService.get<string>('DB_URI'),
          autoIndex: true,
          user: configService.get<string>('DB_USER'),
          pass: configService.get<string>('DB_PASS'),
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
