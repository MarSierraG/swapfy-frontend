import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Tag } from '../../models/tag.model';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class TagService {
  private readonly apiUrl = `${environment.apiUrl}/tags`;

  constructor(private http: HttpClient) {}

  // Obtener todas las etiquetas
  getAllTags(): Observable<Tag[]> {
    return this.http.get<Tag[]>(this.apiUrl);
  }

  // Crear una nueva etiqueta
  createTag(tag: Partial<Tag>): Observable<Tag> {
    return this.http.post<Tag>(this.apiUrl, tag);
  }

  // Actualizar etiqueta
  updateTag(id: number, data: Partial<Tag>, force: boolean = false): Observable<Tag> {
    return this.http.put<Tag>(`${this.apiUrl}/${id}?force=${force}`, data);
  }


  // Eliminar etiqueta
  deleteTag(tagId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${tagId}`);
  }
}
