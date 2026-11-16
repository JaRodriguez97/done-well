import { TestBed } from '@angular/core/testing';
import { Storage } from '@ionic/storage-angular';
import { StorageService } from './storage.service';
import { STORAGE_KEYS } from '../constants/storage-keys.constants';
import { TaskItem } from '../models/task.model';
import { CategoryItem } from '../models/category.model';

describe('StorageService', () => {
  let service: StorageService;
  let storageSpy: jasmine.SpyObj<Storage>;

  beforeEach(() => {
    storageSpy = jasmine.createSpyObj<Storage>('Storage', [
      'create',
      'get',
      'set',
      'remove',
    ]);
    storageSpy.create.and.resolveTo(storageSpy);

    TestBed.configureTestingModule({
      providers: [
        StorageService,
        { provide: Storage, useValue: storageSpy },
      ],
    });

    service = TestBed.inject(StorageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize storage only once across concurrent calls', async () => {
    storageSpy.get.and.resolveTo([]);

    await Promise.all([
      service.get(STORAGE_KEYS.TASKS),
      service.get(STORAGE_KEYS.CATEGORIES),
    ]);

    expect(storageSpy.create).toHaveBeenCalledTimes(1);
    expect(storageSpy.get).toHaveBeenCalledTimes(2);
  });

  it('should return null when key does not exist', async () => {
    storageSpy.get.and.resolveTo(undefined);

    const result = await service.get<string[]>('unknown_key');

    expect(result).toBeNull();
    expect(storageSpy.get).toHaveBeenCalledOnceWith('unknown_key');
  });

  it('should persist and retrieve typed values', async () => {
    const mockTasks = [{ id: '1', title: 'Enviar informe semanal', completed: false }];
    storageSpy.set.and.resolveTo(mockTasks);
    storageSpy.get.and.resolveTo(mockTasks);

    await service.set(STORAGE_KEYS.TASKS, mockTasks);
    const loaded = await service.get<typeof mockTasks>(STORAGE_KEYS.TASKS);

    expect(storageSpy.set).toHaveBeenCalledOnceWith(STORAGE_KEYS.TASKS, mockTasks);
    expect(loaded).toEqual(mockTasks);
  });

  it('should remove a key from storage', async () => {
    storageSpy.remove.and.resolveTo(undefined);

    await service.remove(STORAGE_KEYS.TASKS);

    expect(storageSpy.remove).toHaveBeenCalledOnceWith(STORAGE_KEYS.TASKS);
  });

  describe('TaskItem & CategoryItem', () => {
    it('should trim task title, generate metadata and toggle completion', () => {
      const task = new TaskItem({
        title: '  Enviar informe semanal  ',
        categoryId: 'cat-trabajo',
      });

      expect(task.id).toBeTruthy();
      expect(task.createdAt).toBeTruthy();
      expect(task.title).toBe('Enviar informe semanal');
      expect(task.completed).toBeFalse();

      task.toggleCompleted();
      expect(task.completed).toBeTrue();

      task.assignCategory('cat-urgente');
      expect(task.categoryId).toBe('cat-urgente');

      task.assignCategory(null);
      expect(task.categoryId).toBeNull();
    });

    it('should throw an error when task title is empty', () => {
      expect(() => new TaskItem({ title: '   ' })).toThrowError(
        'El título de la tarea no puede estar vacío.'
      );
    });

    it('should validate category name and serialize to plain object', () => {
      const category = new CategoryItem({
        name: '   Deporte ',
        colorKey: 'turquesa',
        icon: 'fitness-outline',
      });

      const plain = category.toPlainObject();
      expect(plain.name).toBe('Deporte');
      expect(plain.colorKey).toBe('turquesa');
      expect(() => {
        category.name = ' ';
      }).toThrowError('El nombre de la categoría no puede estar vacío.');
    });

    it('should update editable category properties and reject empty name', () => {
      const category = new CategoryItem({
        name: 'Trabajo',
        colorKey: 'violeta',
        icon: 'briefcase-outline',
      });

      category.update({
        name: '  Oficina  ',
        colorKey: 'coral',
        icon: 'flame-outline',
      });

      expect(category.name).toBe('Oficina');
      expect(category.colorKey).toBe('coral');
      expect(category.icon).toBe('flame-outline');
      expect(() => category.update({ name: '   ' })).toThrowError(
        'El nombre de la categoría no puede estar vacío.'
      );
    });
  });
});
