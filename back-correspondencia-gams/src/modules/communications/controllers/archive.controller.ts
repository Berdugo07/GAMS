import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';

import { GetAccountRequest, onlyAssignedAccount } from 'src/modules/administration/decorators';
import { Account } from 'src/modules/administration/schemas';
import { CreateArchiveDto, FilterArchiveDto } from '../dtos';
import { ArchiveService } from '../services';

@onlyAssignedAccount()
@Controller('archives')
export class ArchiveController {
  constructor(private readonly archiveService: ArchiveService) {}

  @Get()
  findAll(@Query() queryParams: FilterArchiveDto, @GetAccountRequest() account: Account) {
    return this.archiveService.findAll(queryParams, account);
  }

  @Post()
  archive(@Body() archiveDto: CreateArchiveDto, @GetAccountRequest() account: Account) {
    return this.archiveService.create(account, archiveDto);
  }

  @Delete(':id')
  unarchive(@Param('id') id: string, @GetAccountRequest() account: Account) {
    return this.archiveService.remove(id, account);
  }


}
