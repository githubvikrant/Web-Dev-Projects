import { Migration } from '@mikro-orm/migrations';

export class Migration20250721120324 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table \`request_history\` (\`id\` integer not null primary key autoincrement, \`method\` text not null, \`url\` text not null, \`request_body\` text null, \`response_body\` text null, \`response_status\` text null, \`created_at\` datetime not null);`);
  }

}
