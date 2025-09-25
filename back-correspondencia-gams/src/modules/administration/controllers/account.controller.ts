import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';

import {
  AccountService,
  DependencieService,
  InstitutionService,
  OfficerService,
} from 'src/modules/administration/services';
import { CreateAccountWithUserDto, FilterAccountDto, UpdateAccountWithUserDto } from '../dtos';

import { IsMongoidPipe } from 'src/modules/common';
import { RoleService } from '../../users/services';

@Controller('accounts')
export class AccountController {
  constructor(
    private readonly accountService: AccountService,
    private readonly institutionService: InstitutionService,
    private readonly dependencieService: DependencieService,
    private readonly officerService: OfficerService,
    private readonly roleService: RoleService,
  ) {}

  @Get()
  findAll(@Query() params: FilterAccountDto) {
    return this.accountService.findAll(params);
  }

  @Post()
  create(@Body() accountDto: CreateAccountWithUserDto) {
    return this.accountService.create(accountDto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: UpdateAccountWithUserDto) {
    return this.accountService.update(id, body);
  }

  @Get('institutions')
  getInstitutions() {
    return this.institutionService.getActiveInstitutions();
  }

  @Get('dependencies/:institutionId')
  getDependencies(@Param('institutionId', IsMongoidPipe) institutionId: string) {
    return this.dependencieService.getActiveDependenciesOfInstitution(institutionId);
  }

  @Get('assign')
  searchOfficersWithoutAccount(@Query('term') text: string) {
    return this.officerService.searchOfficersWithoutAccount(text);
  }

  @Get('roles')
  getRoles() {
    return this.roleService.getActiveRoles();
  }

  @Get('reset-password/:accountId')
  resetCrendtials(@Param('accountId') accountId: string) {
    return this.accountService.resetAccountPassword(accountId);
  }
}
