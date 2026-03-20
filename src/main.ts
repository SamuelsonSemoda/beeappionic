import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { HttpClient } from '@angular/common/http';
import { AppModule } from './app/app.module';

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.log(err));
