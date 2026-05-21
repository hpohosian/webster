import { ChildEntity, Column } from 'typeorm';
import { BaseLayer } from './base-layer.entity';

@ChildEntity('background')
export class BackgroundLayer extends BaseLayer {
  @Column({ default: '#ffffff' })
  color: string;

  @Column({ type: "int", nullable: true })
  width?: number;

  @Column({ type: "int", nullable: true })
  height?: number;
}
