import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StorageService } from './storage.service';
import { File } from '../entities/file.entity';
import { BadRequestException } from '@nestjs/common';

describe('StorageService', () => {
  let service: StorageService;

  const mockFileRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    remove: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key: string, defaultValue?: any) => {
      const config = {
        S3_ENDPOINT: 'http://localhost:9000',
        S3_ACCESS_KEY: 'test-key',
        S3_SECRET_KEY: 'test-secret',
        S3_BUCKET: 'test-bucket',
      };
      return config[key] || defaultValue;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StorageService,
        {
          provide: getRepositoryToken(File),
          useValue: mockFileRepository,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<StorageService>(StorageService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateUploadUrl', () => {
    it('should reject files larger than 100MB', async () => {
      const largeFileSize = 101 * 1024 * 1024; // 101MB

      await expect(
        service.generateUploadUrl('test.pdf', 'application/pdf', largeFileSize, 'user-123'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should accept files smaller than 100MB', async () => {
      const validFileSize = 50 * 1024 * 1024; // 50MB
      const mockFile = {
        id: 'file-123',
        filename: 'test.pdf',
        contentType: 'application/pdf',
        size: validFileSize,
        storageKey: 'some-key.pdf',
        uploadedBy: 'user-123',
      };

      mockFileRepository.create.mockReturnValue(mockFile);
      mockFileRepository.save.mockResolvedValue(mockFile);

      const result = await service.generateUploadUrl(
        'test.pdf',
        'application/pdf',
        validFileSize,
        'user-123',
      );

      expect(result).toHaveProperty('uploadUrl');
      expect(result).toHaveProperty('fileId');
      expect(result).toHaveProperty('storageKey');
      expect(mockFileRepository.create).toHaveBeenCalled();
      expect(mockFileRepository.save).toHaveBeenCalled();
    });
  });

  describe('getFileMetadata', () => {
    it('should throw BadRequestException when file not found', async () => {
      mockFileRepository.findOne.mockResolvedValue(null);

      await expect(service.getFileMetadata('non-existent-id')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should return file metadata when file exists', async () => {
      const mockFile = {
        id: 'file-123',
        filename: 'test.pdf',
        contentType: 'application/pdf',
        size: 1024,
        storageKey: 'some-key.pdf',
        uploadedBy: 'user-123',
      };

      mockFileRepository.findOne.mockResolvedValue(mockFile);

      const result = await service.getFileMetadata('file-123');

      expect(result).toEqual(mockFile);
      expect(mockFileRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'file-123' },
        relations: ['uploadedByUser'],
      });
    });
  });

  describe('listUserFiles', () => {
    it('should return files uploaded by user', async () => {
      const mockFiles = [
        {
          id: 'file-1',
          filename: 'test1.pdf',
          uploadedBy: 'user-123',
        },
        {
          id: 'file-2',
          filename: 'test2.pdf',
          uploadedBy: 'user-123',
        },
      ];

      mockFileRepository.find.mockResolvedValue(mockFiles);

      const result = await service.listUserFiles('user-123');

      expect(result).toEqual(mockFiles);
      expect(mockFileRepository.find).toHaveBeenCalledWith({
        where: { uploadedBy: 'user-123' },
        order: { uploadedAt: 'DESC' },
      });
    });
  });
});
