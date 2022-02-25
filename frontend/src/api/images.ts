import { AsyncFailable, HasFailed } from 'imagur-shared/dist/types';
import { ImageUploadResponse } from 'imagur-shared/dist/dto/images.dto';
import { ImageUploadRequest } from '../frontenddto/imageroute.dto';
import ImagurApi from './api';

export interface ImageLinks {
  source: string;
  markdown: string;
  html: string;
  rst: string;
  bbcode: string;
}
export default class ImagesApi extends ImagurApi {
  public static readonly I = new ImagesApi();

  protected constructor() {
    super();
  }

  public async UploadImage(image: File): AsyncFailable<string> {
    const result = await this.api.postForm(
      ImageUploadResponse,
      '/i',
      new ImageUploadRequest(image),
    );

    if (HasFailed(result)) return result;

    return result.hash;
  }

  public static GetImageURL(image: string): string {
    const baseURL = window.location.protocol + '//' + window.location.host;

    return `${baseURL}/i/${image}`;
  }

  public static CreateImageLinks(imageURL: string) {
    return {
      source: imageURL,
      markdown: `![image](${imageURL})`,
      html: `<img src="${imageURL}" alt="image">`,
      rst: `.. image:: ${imageURL}`,
      bbcode: `[img]${imageURL}[/img]`,
    };
  }
}