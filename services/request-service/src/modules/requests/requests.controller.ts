import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { RequestsService } from './requests.service';
import { CreateRequestDto, UpdateRequestDto, PublishRequestDto, UpdateRequestStatusDto } from './dto/create-request.dto';
import { RequestStatus } from '../../common/entities/request.entity';

@ApiTags('Requests')
@Controller()
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @Post('requests/draft')
  @ApiOperation({ summary: 'Create a new draft request' })
  @ApiResponse({ status: 201, description: 'Draft request created successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request - Invalid input' })
  @ApiResponse({ status: 401, description: 'Unauthorized - JWT required' })
  async createDraft(@Body() createRequestDto: CreateRequestDto, @Request() req: any) {
    const request = await this.requestsService.createDraft(createRequestDto, req.user.sub);
    return { data: request };
  }

  @Patch('requests/:id/draft')
  @ApiOperation({ summary: 'Update a draft request' })
  @ApiResponse({ status: 200, description: 'Draft request updated successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not owner or not a draft' })
  async updateDraft(
    @Param('id') id: string,
    @Body() updateRequestDto: UpdateRequestDto,
    @Request() req: any,
  ) {
    const request = await this.requestsService.updateDraft(id, updateRequestDto, req.user.sub);
    return { data: request };
  }

  @Patch('requests/:id/publish')
  @ApiOperation({ summary: 'Publish a draft request' })
  @ApiResponse({ status: 200, description: 'Request published successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request - Invalid request or incomplete' })
  async publishRequest(
    @Param('id') id: string,
    @Body() publishDto: PublishRequestDto,
    @Request() req: any,
  ) {
    const request = await this.requestsService.publishRequest(id, publishDto, req.user.sub);
    return { data: request };
  }

  @Patch('requests/:id/status')
  @ApiOperation({ summary: 'Update request status' })
  @ApiResponse({ status: 200, description: 'Request status updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request - Invalid status transition' })
  async updateRequestStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateRequestStatusDto,
    @Request() req: any,
  ) {
    const request = await this.requestsService.updateRequestStatus(id, updateStatusDto, req.user.sub);
    return { data: request };
  }

  @Get('requests/my-requests')
  @ApiOperation({ summary: 'Get current user\'s requests' })
  @ApiResponse({ status: 200, description: 'User requests retrieved successfully' })
  async getMyRequests(
    @Request() req: any,
    @Query('status') status?: RequestStatus,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const result = await this.requestsService.getMyRequests(
      req.user.sub,
      status,
      page || 1,
      limit || 20,
    );
    return { data: result };
  }

  @Get('requests/:id')
  @ApiOperation({ summary: 'Get request by ID' })
  @ApiResponse({ status: 200, description: 'Request retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Request not found' })
  async getRequestById(@Param('id') id: string, @Request() req: any) {
    const request = await this.requestsService.getRequestById(id, req.user?.sub);
    return { data: request };
  }

  @Delete('requests/:id')
  @ApiOperation({ summary: 'Delete a draft request' })
  @ApiResponse({ status: 200, description: 'Request deleted successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not owner or not a draft' })
  async deleteRequest(@Param('id') id: string, @Request() req: any) {
    await this.requestsService.deleteRequest(id, req.user.sub);
    return { message: 'Request deleted successfully' };
  }
}
