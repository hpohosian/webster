import { ChildEntity, Column } from 'typeorm';
import { BaseLayer } from './base-layer.entity';

@ChildEntity('background')
export class BackgroundLayer extends BaseLayer {
  @Column({ default: '#ffffff' })
  color: string;

  @Column()
  width: number;

  @Column()
  height: number;
}
