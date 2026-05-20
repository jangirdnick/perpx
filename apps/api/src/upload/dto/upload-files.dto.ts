import {
  // IsArray,
  // ArrayMinSize,
  // ValidateNested,
  IsString,
  IsNotEmpty,
} from 'class-validator';
// import { Type } from 'class-transformer';

export class UploadFileItemDto {
  @IsString()
  @IsNotEmpty()
  fileName!: string;

  @IsString()
  @IsNotEmpty()
  fileType!: string;
}

// export class UploadFilesDto {
//   @IsArray()
//   @ArrayMinSize(1)
//   @ValidateNested({ each: true })
//   @Type(() => UploadFileItemDto)
//   files!: UploadFileItemDto[];
// }
