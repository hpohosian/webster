import { ChildEntity, Column } from 'typeorm';
import { BaseLayer } from './base-layer.entity';

@ChildEntity('image')
export class ImageLayer extends BaseLayer {
  @Column()
  src: string;

  @Column()
  width: number;

  @Column()
  height: number;
}
