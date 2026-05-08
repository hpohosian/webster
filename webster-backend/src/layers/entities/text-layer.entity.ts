import { BaseLayer } from "./base-layer.entity";
import { ChildEntity, Column } from 'typeorm';

@ChildEntity('text')
export class TextLayer extends BaseLayer {
  @Column()
  text: string;

  @Column({ default: 32 })
  fontSize: number;

  @Column({ default: '#000000' })
  color: string;
}
