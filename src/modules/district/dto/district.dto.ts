export interface DistrictListItemDto {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  mosquitoIndex: number;
  level: string;
}

export interface DistrictListDto {
  districts: DistrictListItemDto[];
}

export interface DistrictDetailDto extends DistrictListItemDto {
  description: string;
  updatedAt: string;
}
