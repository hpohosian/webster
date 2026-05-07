import { ChildEntity, Column } from 'typeorm';
import { BaseLayer } from './base-layer.entity';

@ChildEntity('shape')
export class ShapeLayer extends BaseLayer {
  @Column()
  shapeType: string;

  @Column({ default: '#000000' })
  fill: string;
}
