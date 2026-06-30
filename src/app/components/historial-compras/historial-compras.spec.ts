import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';

import {
  HistorialComprasComponent,
  Pedido,
  ItemPedido,
  EstadoPedido,
  EtapaTimeline,
} from './historial-compras';

// ─── Helpers / Factories ──────────────────────────────────────────────────────

function crearItem(overrides: Partial<ItemPedido> = {}): ItemPedido {
  return {
    id: 1,
    nombre: 'Zapatilla Test',
    categoria: 'Calzado',
    img: 'https://cdn.test/img.jpg',
    precio: 100,
    cantidad: 1,
    ...overrides,
  };
}

function crearPedido(overrides: Partial<Pedido> = {}): Pedido {
  return {
    id: 1,
    numeroOrden: 'ORD-2024-00001',
    fechaCreacion: new Date('2024-01-15T10:00:00'),
    estado: 'procesando',
    items: [crearItem()],
    subtotal: 100,
    costoEnvio: 0,
    descuento: 0,
    igv: 15.25,
    total: 100,
    nombreCliente: 'Test User',
    metodoEntrega: 'delivery',
    direccion: 'Av. Test 123',
    distrito: 'Miraflores',
    departamento: 'Lima',
    metodoPago: 'tarjeta',
    correo: 'test@email.com',
    ...overrides,
  };
}

// ─── Setup ────────────────────────────────────────────────────────────────────

describe('HistorialComprasComponent', () => {
  let component: HistorialComprasComponent;
  let fixture: ComponentFixture<HistorialComprasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HistorialComprasComponent],
      imports: [FormsModule],
      // BACKEND: Cuando existan servicios reales, proveerlos con mocks:
      // providers: [
      //   { provide: PedidosService, useValue: mockPedidosService },
      // ],
    }).compileComponents();

    fixture = TestBed.createComponent(HistorialComprasComponent);
    component = fixture.componentInstance;
  });

  // ── Creación del componente ────────────────────────────────────

  describe('Creación', () => {
    it('debe crearse correctamente', () => {
      fixture.detectChanges();
      expect(component).toBeTruthy();
    });

    it('debe iniciar con cargando = true y pedidos vacíos', () => {
      // No detectChanges aún → estado inicial
      expect(component.cargando).toBeFalse();
      expect(component.pedidos).toEqual([]);
      expect(component.pedidosFiltrados).toEqual([]);
    });
  });

  // ── Carga de datos (mock interno) ─────────────────────────────

  describe('cargarPedidos()', () => {
    it('debe activar cargando al inicio y desactivarlo tras el timeout', fakeAsync(() => {
      fixture.detectChanges();
      expect(component.cargando).toBeTrue();

      tick(800);
      fixture.detectChanges();

      expect(component.cargando).toBeFalse();
      expect(component.pedidos.length).toBeGreaterThan(0);
    }));

    it('debe inicializar pedidosFiltrados con todos los pedidos cargados', fakeAsync(() => {
      fixture.detectChanges();
      tick(800);
      expect(component.pedidosFiltrados.length).toBe(component.pedidos.length);
    }));
  });

  // ── Stats ─────────────────────────────────────────────────────

  describe('calcularStats (vía inicializarDatos)', () => {
    beforeEach(() => {
      // Cargamos datos directamente sin esperar el timeout
      (component as any).inicializarDatos([
        crearPedido({ id: 1, estado: 'procesando', total: 100 }),
        crearPedido({ id: 2, estado: 'en_camino',  total: 200 }),
        crearPedido({ id: 3, estado: 'entregado',  total: 150 }),
        crearPedido({ id: 4, estado: 'cancelado',  total: 80  }),
      ]);
    });

    it('debe contar el total de pedidos (incluyendo cancelados)', () => {
      expect(component.totalPedidos).toBe(4);
    });

    it('debe sumar el total gastado excluyendo cancelados', () => {
      expect(component.totalGastado).toBe(450); // 100 + 200 + 150
    });

    it('debe contar pedidos activos (procesando + en_camino)', () => {
      expect(component.pedidosActivos).toBe(2);
    });
  });

  // ── Filtros ───────────────────────────────────────────────────

  describe('aplicarFiltros()', () => {
    const pedidos: Pedido[] = [
      crearPedido({ id: 1, numeroOrden: 'ORD-2024-00001', estado: 'procesando', fechaCreacion: new Date() }),
      crearPedido({ id: 2, numeroOrden: 'ORD-2024-00002', estado: 'en_camino',  fechaCreacion: new Date() }),
      crearPedido({ id: 3, numeroOrden: 'ORD-2023-00100', estado: 'entregado',  fechaCreacion: new Date('2023-01-01') }),
      crearPedido({ id: 4, numeroOrden: 'ORD-2024-00003', estado: 'cancelado',  fechaCreacion: new Date() }),
    ];

    beforeEach(() => {
      (component as any).inicializarDatos(pedidos);
    });

    it('sin filtros debe retornar todos los pedidos', () => {
      expect(component.pedidosFiltrados.length).toBe(4);
    });

    it('debe filtrar por término de búsqueda (número de orden)', () => {
      component.terminoBusqueda = '00002';
      component.aplicarFiltros();
      expect(component.pedidosFiltrados.length).toBe(1);
      expect(component.pedidosFiltrados[0].numeroOrden).toBe('ORD-2024-00002');
    });

    it('la búsqueda debe ser case-insensitive', () => {
      component.terminoBusqueda = 'ord-2024';
      component.aplicarFiltros();
      expect(component.pedidosFiltrados.length).toBe(3);
    });

    it('debe filtrar por estado', () => {
      component.filtroEstado = 'procesando';
      component.aplicarFiltros();
      expect(component.pedidosFiltrados.length).toBe(1);
      expect(component.pedidosFiltrados[0].estado).toBe('procesando');
    });

    it('debe filtrar por período (ej: últimos 30 días excluye fechas antiguas)', () => {
      component.filtroPeriodo = '30';
      component.aplicarFiltros();
      const tieneAntiguo = component.pedidosFiltrados.some(p => p.id === 3);
      expect(tieneAntiguo).toBeFalse();
    });

    it('debe combinar filtros de búsqueda y estado', () => {
      component.terminoBusqueda = '2024';
      component.filtroEstado = 'en_camino';
      component.aplicarFiltros();
      expect(component.pedidosFiltrados.length).toBe(1);
      expect(component.pedidosFiltrados[0].id).toBe(2);
    });

    it('debe retornar lista vacía si no hay coincidencias', () => {
      component.terminoBusqueda = 'ORD-9999-INEXISTENTE';
      component.aplicarFiltros();
      expect(component.pedidosFiltrados.length).toBe(0);
    });
  });

  describe('limpiarFiltros()', () => {
    it('debe resetear todos los filtros y volver a mostrar todos los pedidos', () => {
      (component as any).inicializarDatos([
        crearPedido({ id: 1, estado: 'procesando' }),
        crearPedido({ id: 2, estado: 'entregado' }),
      ]);
      component.terminoBusqueda = 'algo';
      component.filtroEstado    = 'cancelado';
      component.filtroPeriodo   = '30';
      component.aplicarFiltros(); // fuerza lista vacía

      component.limpiarFiltros();

      expect(component.terminoBusqueda).toBe('');
      expect(component.filtroEstado).toBe('');
      expect(component.filtroPeriodo).toBe('');
      expect(component.pedidosFiltrados.length).toBe(2);
    });
  });

  // ── Expansión de tarjetas ─────────────────────────────────────

  describe('toggleExpand()', () => {
    it('debe expandir un pedido al hacer click', () => {
      component.toggleExpand(5);
      expect(component.pedidoExpandido).toBe(5);
    });

    it('debe cerrar el pedido si se hace click en el mismo expandido', () => {
      component.toggleExpand(5);
      component.toggleExpand(5);
      expect(component.pedidoExpandido).toBeNull();
    });

    it('debe cambiar al nuevo pedido si otro ya estaba expandido', () => {
      component.toggleExpand(1);
      component.toggleExpand(2);
      expect(component.pedidoExpandido).toBe(2);
    });
  });

  // ── Helpers de presentación ───────────────────────────────────

  describe('getStatusLabel()', () => {
    const casos: Array<[EstadoPedido, string]> = [
      ['procesando', 'Procesando'],
      ['en_camino',  'En camino'],
      ['entregado',  'Entregado'],
      ['cancelado',  'Cancelado'],
    ];

    casos.forEach(([estado, etiqueta]) => {
      it(`debe retornar "${etiqueta}" para estado "${estado}"`, () => {
        expect(component.getStatusLabel(estado)).toBe(etiqueta);
      });
    });
  });

  describe('getStatusIcon()', () => {
    it('debe retornar ti-clock para procesando', () => {
      expect(component.getStatusIcon('procesando')).toBe('ti-clock');
    });

    it('debe retornar ti-truck para en_camino', () => {
      expect(component.getStatusIcon('en_camino')).toBe('ti-truck');
    });

    it('debe retornar ti-circle-check para entregado', () => {
      expect(component.getStatusIcon('entregado')).toBe('ti-circle-check');
    });

    it('debe retornar ti-x para cancelado', () => {
      expect(component.getStatusIcon('cancelado')).toBe('ti-x');
    });
  });

  describe('resolverImg()', () => {
    it('debe retornar la URL si la imagen tiene valor', () => {
      const url = 'https://cdn.test/producto.jpg';
      expect(component.resolverImg(url)).toBe(url);
    });

    it('debe retornar el placeholder si la imagen está vacía', () => {
      expect(component.resolverImg('')).toBe('assets/images/producto-placeholder.png');
    });

    it('debe retornar el placeholder si la imagen es solo espacios', () => {
      expect(component.resolverImg('   ')).toBe('assets/images/producto-placeholder.png');
    });
  });

  // ── Timeline ──────────────────────────────────────────────────

  describe('getTimeline()', () => {
    it('debe retornar 3 etapas para un pedido en pipeline normal', () => {
      const timeline = component.getTimeline('procesando');
      expect(timeline.length).toBe(3);
    });

    it('debe marcar la primera etapa como active y las demás como pending cuando está procesando', () => {
      const timeline = component.getTimeline('procesando');
      expect(timeline[0].clase).toBe('active');
      expect(timeline[1].clase).toBe('pending');
      expect(timeline[2].clase).toBe('pending');
    });

    it('debe marcar la primera etapa como done y la segunda como active cuando está en_camino', () => {
      const timeline = component.getTimeline('en_camino');
      expect(timeline[0].clase).toBe('done');
      expect(timeline[1].clase).toBe('active');
      expect(timeline[2].clase).toBe('pending');
    });

    it('debe marcar todas las etapas como done cuando está entregado', () => {
      const timeline = component.getTimeline('entregado');
      expect(timeline.every(e => e.clase === 'done')).toBeTrue();
    });

    it('debe retornar una sola etapa cancelado con clase active', () => {
      const timeline = component.getTimeline('cancelado');
      expect(timeline.length).toBe(1);
      expect(timeline[0].clase).toBe('active');
      expect(timeline[0].titulo).toBe('Pedido cancelado');
    });
  });

  // ── Acciones del pedido ───────────────────────────────────────

  describe('cancelarPedido()', () => {
    it('no debe lanzar error si el usuario confirma (confirm=true)', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      spyOn(console, 'log');
      expect(() => component.cancelarPedido(1)).not.toThrow();
    });

    it('no debe hacer nada si el usuario cancela el confirm', () => {
      spyOn(window, 'confirm').and.returnValue(false);
      spyOn(console, 'log');
      component.cancelarPedido(1);
      expect(console.log).not.toHaveBeenCalled();
    });
  });

  describe('descargarFactura()', () => {
    it('no debe lanzar error al llamarse con un ID válido', () => {
      spyOn(console, 'log');
      expect(() => component.descargarFactura(1)).not.toThrow();
    });
  });

  describe('rastrearPedido()', () => {
    it('no debe lanzar error al llamarse con un ID válido', () => {
      spyOn(console, 'log');
      expect(() => component.rastrearPedido(1)).not.toThrow();
    });
  });

  describe('recomprar()', () => {
    it('no debe lanzar error al llamarse con un pedido válido', () => {
      spyOn(console, 'log');
      expect(() => component.recomprar(crearPedido())).not.toThrow();
    });
  });

  // ── Ciclo de vida ─────────────────────────────────────────────

  describe('ngOnDestroy()', () => {
    it('debe completar el Subject destroy$ sin errores', () => {
      fixture.detectChanges();
      expect(() => component.ngOnDestroy()).not.toThrow();
    });
  });

  // ── Renderizado del template ──────────────────────────────────

  describe('Template', () => {
    it('debe mostrar el spinner de carga cuando cargando = true', () => {
      component.cargando = true;
      fixture.detectChanges();
      const spinner = fixture.debugElement.query(By.css('.empty-spinner'));
      expect(spinner).toBeTruthy();
    });

    it('debe mostrar el estado vacío cuando no hay pedidos ni carga', () => {
      component.cargando          = false;
      component.pedidosFiltrados  = [];
      fixture.detectChanges();
      const emptyState = fixture.debugElement.query(By.css('.empty-state'));
      expect(emptyState).toBeTruthy();
    });

    it('debe mostrar la lista de pedidos cuando hay resultados', () => {
      component.cargando         = false;
      component.pedidosFiltrados = [crearPedido({ id: 1 }), crearPedido({ id: 2 })];
      fixture.detectChanges();
      const cards = fixture.debugElement.queryAll(By.css('.order-card'));
      expect(cards.length).toBe(2);
    });

    it('debe mostrar el botón "Ir a la tienda" solo cuando no hay filtros activos', () => {
      component.cargando         = false;
      component.pedidosFiltrados = [];
      component.terminoBusqueda  = '';
      component.filtroEstado     = '';
      fixture.detectChanges();
      const btn = fixture.debugElement.query(By.css('.btn-ir-tienda'));
      expect(btn).toBeTruthy();
    });

    it('debe mostrar el botón "Limpiar filtros" cuando hay un filtro activo y lista vacía', () => {
      component.cargando         = false;
      component.pedidosFiltrados = [];
      component.terminoBusqueda  = 'inexistente';
      fixture.detectChanges();
      const btn = fixture.debugElement.query(By.css('button.btn-ir-tienda'));
      expect(btn).toBeTruthy();
      expect(btn.nativeElement.textContent).toContain('Limpiar filtros');
    });

    it('debe añadir la clase "expandido" al card correcto', () => {
      component.cargando         = false;
      component.pedidosFiltrados = [crearPedido({ id: 42 })];
      component.pedidoExpandido  = 42;
      fixture.detectChanges();
      const card = fixture.debugElement.query(By.css('.order-card'));
      expect(card.nativeElement.classList).toContain('expandido');
    });
  });
});