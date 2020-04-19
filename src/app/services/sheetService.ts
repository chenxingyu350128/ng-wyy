import { API_CONFIG } from './services.module'

@Injectable({
  providedIn: ServicesModule
})
export class SheetService {

  constructor(private http: HttpClient, @Inject(API_CONFIG) private uri: string) { }
  
  getEnterSinger(args: SingerParams = defaultParams): Observable<Singer[]>{
    const params = new HttpParams({ fromString: queryString.stringify(args) })
    return this.http.get(this.uri + 'artist/list', { params })
    .pipe(map((res: { artists: Singer[] }) => res.artists))
  }

}
