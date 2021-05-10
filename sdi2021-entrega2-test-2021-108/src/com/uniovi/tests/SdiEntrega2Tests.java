package com.uniovi.tests;

//Paquetes Java
import java.util.List;
//Paquetes JUnit 
import org.junit.*;
import org.junit.runners.MethodSorters;
import static org.junit.Assert.assertTrue;
//Paquetes Selenium 
import org.openqa.selenium.*;
import org.openqa.selenium.firefox.*;
//Paquetes Utilidades de Testing Propias
import com.uniovi.tests.util.SeleniumUtils;
//Paquetes con los Page Object
import com.uniovi.tests.pageobjects.*;

//Ordenamos las pruebas por el nombre del método
@FixMethodOrder(MethodSorters.NAME_ASCENDING)
public class SdiEntrega2Tests {
	// En Windows (Debe ser la versión 65.0.1 y desactivar las actualizacioens
	// automáticas)):
	// static String PathFirefox65 = "C:\\Program Files\\Mozilla
	// Firefox\\firefox.exe";
	// static String Geckdriver024 = "C:\\Path\\geckodriver024win64.exe";
	// En MACOSX (Debe ser la versión 65.0.1 y desactivar las actualizacioens
	// automáticas):
	static String PathFirefox65 = "C:\\Program Files\\Mozilla Firefox\\firefox.exe";
	// static String PathFirefox64 =
	// "/Applications/Firefox.app/Contents/MacOS/firefox-bin";
	static String Geckdriver024 = "C:\\Users\\nacho\\Desktop\\PL-SDI-Sesion5-material\\geckodriver024win64.exe";
	// static String Geckdriver022 =
	// "/Users/delacal/Documents/SDI1718/firefox/geckodriver023mac";
	// Común a Windows y a MACOSX
	static WebDriver driver = getDriver(PathFirefox65, Geckdriver024);
	static String URL = "https://localhost:8081";

	public static WebDriver getDriver(String PathFirefox, String Geckdriver) {
		System.setProperty("webdriver.firefox.bin", PathFirefox);
		System.setProperty("webdriver.gecko.driver", Geckdriver);
		WebDriver driver = new FirefoxDriver();
		return driver;
	}

	@Before
	public void setUp() {
		driver.navigate().to(URL + "/pruebas");
		SeleniumUtils.EsperaCargaPagina(driver, "text", "Bienvenido a MyWallapop", PO_View.getTimeout());
		driver.navigate().to(URL);

	}

	@After
	public void tearDown() {
		driver.manage().deleteAllCookies();
	}

	@BeforeClass
	static public void begin() {
		// COnfiguramos las pruebas.
		// Fijamos el timeout en cada opción de carga de una vista. 2 segundos.
		PO_View.setTimeout(3);
		// SeleniumUtils.EsperaCargaPagina(driver, "free", "//tbody/tr",
		// PO_View.getTimeout());

	}

	@AfterClass
	static public void end() {
		// Cerramos el navegador al finalizar las pruebas
		driver.quit();
	}

	// PR01. Registro de Usuario con datos válidos.
	@Test
	public void PR01() {
		PO_HomeView.clickOption(driver, "registrarse", "class", "btn btn-primary");
		PO_RegisterView.fillForm(driver, "Josefo", "Perez", "pruebapr01@gmail.com", "77777", "77777");
		PO_View.checkElement(driver, "text", "pruebapr01@gmail.com");
	}

	// PR02. Registro de Usuario con datos inválidos (email, nombre y apellidos
	// vacíos).
	@Test
	public void PR02() {
		PO_HomeView.clickOption(driver, "registrarse", "class", "btn btn-primary");
		PO_RegisterView.fillForm(driver, "", "", "", "77777", "77777");
		PO_View.checkElement(driver, "text", "El campo Nombre no puede ser vacio.");
		PO_View.checkElement(driver, "text", "El campo Apellido no puede ser vacio.");
		PO_View.checkElement(driver, "text", "El campo Email no puede ser vacio.");
		PO_View.checkElement(driver, "text", "El nombre ha de estar entre 5 y 20 caracteres.");
		PO_View.checkElement(driver, "text", "El apellido ha de estar entre 5 y 20 caracteres.");
	}

	// PR03. Registro de Usuario con datos inválidos (repetición de contraseña
	// inválida).
	@Test
	public void PR03() {
		PO_HomeView.clickOption(driver, "registrarse", "class", "btn btn-primary");
		PO_RegisterView.fillForm(driver, "Josefo", "Perez", "pruebapr02@gmail.com", "77778", "77777");
		PO_View.checkElement(driver, "text", "La contraña no coincide en ambos campos.");
	}

	// PR04. Registro de Usuario con datos inválidos (email existente).
	@Test
	public void PR04() {
		PO_HomeView.clickOption(driver, "registrarse", "class", "btn btn-primary");
		PO_RegisterView.fillForm(driver, "Josefo", "Perez", "admin@email.com", "77777", "77777");
		PO_View.checkElement(driver, "text", "El email introducido ya existe en otra cuenta.");
	}

	// PR05. Inicio de sesión con datos válidos.
	@Test
	public void PR05() {
		PO_HomeView.clickOption(driver, "identificarse", "class", "btn btn-primary");
		PO_LoginView.fillForm(driver, "admin@email.com", "admin");
		PO_View.checkElement(driver, "text", "admin@email.com");
	}

	// PR06. Inicio de sesión con datos inválidos (email existente, pero contraseña
	// incorrecta).
	@Test
	public void PR06() {
		PO_HomeView.clickOption(driver, "identificarse", "class", "btn btn-primary");
		PO_LoginView.fillForm(driver, "admin@email.com", "1234");
		PO_View.checkElement(driver, "text", "Email o contraseña incorrecto");
	}

	// PR07. Inicio de sesión con datos inválidos (campo email o contraseña vacíos).
	@Test
	public void PR07() {
		PO_HomeView.clickOption(driver, "identificarse", "class", "btn btn-primary");
		PO_LoginView.fillForm(driver, "", "");
		PO_View.checkElement(driver, "text", "Email o contraseña incorrecto");
	}

	// PR08. Inicio de sesión con datos inválidos (email no existente en la
	// aplicación).
	@Test
	public void PR08() {
		PO_HomeView.clickOption(driver, "identificarse", "class", "btn btn-primary");
		PO_LoginView.fillForm(driver, "pr08@email.com", "1234");
		PO_View.checkElement(driver, "text", "Email o contraseña incorrecto");
	}

	// PR09. Hacer click en la opción de salir de sesión y comprobar que se redirige
	// a la página de inicio de sesión (Login).
	@Test
	public void PR09() {
		PO_HomeView.clickOption(driver, "identificarse", "class", "btn btn-primary");
		PO_LoginView.fillForm(driver, "admin@email.com", "admin");
		PO_HomeView.clickOption(driver, "desconectarse", "class", "btn btn-primary");
		PO_View.checkElement(driver, "text", "Identificación de usuario");
	}

	// PR10. Comprobar que el botón cerrar sesión no está visible si el usuario no
	// está autenticado.
	@Test
	public void PR10() {
		try {
			PO_HomeView.clickOption(driver, "desconectarse", "class", "btn btn-primary");
		} catch (Exception e) {
			System.out.println("El boton de logout no esta visible sin login.");
		}
	}

	// PR11. Mostrar el listado de usuarios y comprobar que se muestran todos los
	// que existen en el sistema
	@Test
	public void PR11() {
		PO_HomeView.clickOption(driver, "identificarse", "class", "btn btn-primary");
		PO_LoginView.fillForm(driver, "admin@email.com", "admin");
		PO_HomeView.clickOption(driver, "/usuario/lista", "class", "table table-hover");
		List<WebElement> elementos = SeleniumUtils.EsperaCargaPagina(driver, "free", "//tbody/tr",
				PO_View.getTimeout());
		System.out.println(elementos.get(0).getText());
		assertTrue(elementos.size() == 5);
	}

	// PR12. Ir a la lista de usuarios, borrar el primer usuario de la lista,
	// comprobar que la lista se actualiza y dicho usuario desaparece
	@Test
	public void PR12() {
		PO_HomeView.clickOption(driver, "identificarse", "class", "btn btn-primary");
		PO_LoginView.fillForm(driver, "admin@email.com", "admin");
		PO_HomeView.clickOption(driver, "/usuario/lista", "class", "table table-hover");
		List<WebElement> elementos = SeleniumUtils.EsperaCargaPagina(driver, "free", "//tbody/tr",
				PO_View.getTimeout());
		elementos = driver.findElements(By.id("checkbox"));
		elementos.get(0).click();
		driver.findElement(By.id("btndelete")).click();
		elementos = SeleniumUtils.EsperaCargaPagina(driver, "free", "//tbody/tr", PO_View.getTimeout());
		assertTrue(elementos.size() == 4);
	}

	// PR13. Ir a la lista de usuarios, borrar el último usuario de la lista,
	// comprobar que la lista se actualiza y dicho usuario desaparece.
	@Test
	public void PR13() {
		PO_HomeView.clickOption(driver, "identificarse", "class", "btn btn-primary");
		PO_LoginView.fillForm(driver, "admin@email.com", "admin");
		PO_HomeView.clickOption(driver, "/usuario/lista", "class", "table table-hover");
		List<WebElement> elementos = SeleniumUtils.EsperaCargaPagina(driver, "free", "//tbody/tr",
				PO_View.getTimeout());
		elementos = driver.findElements(By.id("checkbox"));
		elementos.get(elementos.size() - 1).click();
		driver.findElement(By.id("btndelete")).click();
		elementos = SeleniumUtils.EsperaCargaPagina(driver, "free", "//tbody/tr", PO_View.getTimeout());
		assertTrue(elementos.size() == 4);
	}

	// PR14.Ir a la lista de usuarios, borrar 3 usuarios, comprobar que la lista se
	// actualiza y dichos usuarios desaparecen.
	@Test
	public void PR14() {
		PO_HomeView.clickOption(driver, "identificarse", "class", "btn btn-primary");
		PO_LoginView.fillForm(driver, "admin@email.com", "admin");
		PO_HomeView.clickOption(driver, "/usuario/lista", "class", "table table-hover");
		List<WebElement> elementos = SeleniumUtils.EsperaCargaPagina(driver, "free", "//tbody/tr",
				PO_View.getTimeout());
		elementos = driver.findElements(By.id("checkbox"));
		elementos.get(0).click();
		elementos.get(1).click();
		elementos.get(2).click();
		driver.findElement(By.id("btndelete")).click();
		elementos = SeleniumUtils.EsperaCargaPagina(driver, "free", "//tbody/tr", PO_View.getTimeout());
		assertTrue(elementos.size() == 2);
	}

	// PR15. Ir al formulario de alta de oferta, rellenarla con datos válidos y
	// pulsar el botón Submit.Comprobar que la oferta sale en el listado de ofertas
	// de dicho usuario.
	@Test
	public void PR15() {
		PO_HomeView.clickOption(driver, "identificarse", "class", "btn btn-primary");
		PO_LoginView.fillForm(driver, "user1@gmail.com", "123456");

		List<WebElement> elementos = PO_View.checkElement(driver, "free", "//li[contains(@id,'mOfertas')]/a");
		elementos.get(0).click();
		elementos = PO_View.checkElement(driver, "free", "//a[contains(@href, 'oferta/agregar')]");
		elementos.get(0).click();

		PO_AddOfferView.fillForm(driver, "tituloprueba", "descriptionPrueba", "11");

		elementos = PO_View.checkElement(driver, "text", "tituloprueba");
	}

	// PR16. Ir al formulario de alta de oferta, rellenarla con datos inválidos
	// (campo título vacío y precio en negativo) y pulsar el botón Submit.
	// Comprobar que se muestra el mensaje de campo obligatorio.
	@Test
	public void PR16() {
		PO_HomeView.clickOption(driver, "identificarse", "class", "btn btn-primary");
		PO_LoginView.fillForm(driver, "user1@gmail.com", "123456");

		List<WebElement> elementos = PO_View.checkElement(driver, "free", "//li[contains(@id,'mOfertas')]/a");
		elementos.get(0).click();
		elementos = PO_View.checkElement(driver, "free", "//a[contains(@href, 'oferta/agregar')]");
		elementos.get(0).click();

		PO_AddOfferView.fillForm(driver, "", "descriptionPrueba", "-11");
		
		elementos = PO_AddOfferView.checkElement(driver, "id", "error-agrefarOferta");

		assertTrue(elementos.get(0).getText().equals( "El campo del titulo no puede ser vacío."));
		assertTrue(elementos.get(2).getText().equals( "El precio no puede ser negativo."));
	}

	// PR017. Mostrar el listado de ofertas para dicho usuario y comprobar que se
	// muestran todas las que existen para este usuario.
	@Test
	public void PR17() {
		PO_HomeView.clickOption(driver, "identificarse", "class", "btn btn-primary");
		PO_LoginView.fillForm(driver, "user1@gmail.com", "123456");

		List<WebElement> elementos = PO_View.checkElement(driver, "free", "//li[contains(@id,'mOfertas')]/a");
		elementos.get(0).click();
		elementos = PO_View.checkElement(driver, "free", "//a[contains(@href, 'oferta/lista')]");
		elementos.get(0).click();
		elementos = SeleniumUtils.EsperaCargaPagina(driver, "free", "//tbody/tr", PO_View.getTimeout());
		assertTrue(elementos.size() == 3);
	}

	// PR18. Ir a la lista de ofertas, borrar la primera oferta de la lista,
	// comprobar que la lista se actualiza y que la oferta desaparece.
	@Test
	public void PR18() {
		PO_HomeView.clickOption(driver, "identificarse", "class", "btn btn-primary");
		PO_LoginView.fillForm(driver, "user1@gmail.com", "123456");

		List<WebElement> elementos = PO_View.checkElement(driver, "free", "//li[contains(@id,'mOfertas')]/a");
		elementos.get(0).click();
		elementos = PO_View.checkElement(driver, "free", "//a[contains(@href, 'oferta/lista')]");
		elementos.get(0).click();
		elementos = PO_View.checkElement(driver, "free",
				"//td/following-sibling::*/a[contains(@href, 'oferta/eliminar')]");
		elementos.get(0).click();
		elementos = SeleniumUtils.EsperaCargaPagina(driver, "free", "//tbody/tr", PO_View.getTimeout());
		assertTrue(elementos.size() == 2);
	}

	// PR19. Ir a la lista de ofertas, borrar la última oferta de la lista,
	// comprobar que la lista se actualiza y que la oferta desaparece.
	@Test
	public void PR19() {
		PO_HomeView.clickOption(driver, "identificarse", "class", "btn btn-primary");
		PO_LoginView.fillForm(driver, "user1@gmail.com", "123456");

		List<WebElement> elementos = PO_View.checkElement(driver, "free", "//li[contains(@id,'mOfertas')]/a");
		elementos.get(0).click();
		elementos = PO_View.checkElement(driver, "free", "//a[contains(@href, 'oferta/lista')]");
		elementos.get(0).click();
		elementos = PO_View.checkElement(driver, "free",
				"//td/following-sibling::*/a[contains(@href, 'oferta/eliminar')]");
		elementos.get(elementos.size() - 1).click();
		elementos = SeleniumUtils.EsperaCargaPagina(driver, "free", "//tbody/tr", PO_View.getTimeout());
		assertTrue(elementos.size() == 2);
	}

	// P20. Hacer una búsqueda con el campo vacío y comprobar que se muestra la
	// página que corresponde con el listado de las ofertas existentes en el sistema
	@Test
	public void PR20() {
		PO_HomeView.clickOption(driver, "identificarse", "class", "btn btn-primary");
		PO_LoginView.fillForm(driver, "user1@gmail.com", "123456");

		List<WebElement> elementos = PO_View.checkElement(driver, "free", "//li[contains(@id,'mCompras')]/a");
		elementos.get(0).click();
		elementos = PO_View.checkElement(driver, "free", "//a[contains(@href, 'compra/buscar')]");
		elementos.get(0).click();
		PO_SearchOfferView.fillForm(driver, "");

		elementos = SeleniumUtils.EsperaCargaPagina(driver, "free", "//tbody/tr", PO_View.getTimeout());
		assertTrue(elementos.size() == 5);

		elementos = PO_View.checkElement(driver, "free", "//a[contains(@class, 'page-link')]");
		elementos.get(1).click();
		elementos = SeleniumUtils.EsperaCargaPagina(driver, "free", "//tbody/tr", PO_View.getTimeout());
		assertTrue(elementos.size() == 5);

		elementos = PO_View.checkElement(driver, "free", "//a[contains(@class, 'page-link')]");
		elementos.get(2).click();
		elementos = SeleniumUtils.EsperaCargaPagina(driver, "free", "//tbody/tr", PO_View.getTimeout());
		assertTrue(elementos.size() == 2);

	}

	// PR21. Hacer una búsqueda escribiendo en el campo un texto que no exista y
	// comprobar que se muestra la página que corresponde, con la lista de ofertas
	// vacía.
	@Test
	public void PR21() {
		PO_HomeView.clickOption(driver, "identificarse", "class", "btn btn-primary");
		PO_LoginView.fillForm(driver, "user1@gmail.com", "123456");

		List<WebElement> elementos = PO_View.checkElement(driver, "free", "//li[contains(@id,'mCompras')]/a");
		elementos.get(0).click();
		elementos = PO_View.checkElement(driver, "free", "//a[contains(@href, 'compra/buscar')]");
		elementos.get(0).click();
		PO_SearchOfferView.fillForm(driver, "aaaaaaaaaaaaaaaaaa");

		elementos = driver.findElements(By.linkText("Comprar"));
		assertTrue(elementos.size() == 0);
		elementos = driver.findElements(By.linkText("Vendido"));
		assertTrue(elementos.size() == 0);
	}

	// PR22. Hacer una búsqueda escribiendo en el campo un texto en minúscula o
	// mayúscula y comprobar que se muestra la página que corresponde, con la lista
	// de
	// ofertas que contengan dicho texto, independientemente que el título esté
	// almacenado en minúsculas o mayúscula.
	@Test
	public void PR22() {
		PO_HomeView.clickOption(driver, "identificarse", "class", "btn btn-primary");
		PO_LoginView.fillForm(driver, "user1@gmail.com", "123456");

		List<WebElement> elementos = PO_View.checkElement(driver, "free", "//li[contains(@id,'mCompras')]/a");
		elementos.get(0).click();
		elementos = PO_View.checkElement(driver, "free", "//a[contains(@href, 'compra/buscar')]");
		elementos.get(0).click();
		PO_SearchOfferView.fillForm(driver, "LIBRO");

		PO_View.checkElement(driver, "text", "Libro El Imperio Final");

		PO_SearchOfferView.fillForm(driver, "libro");

		PO_View.checkElement(driver, "text", "Libro El Imperio Final");

	}

	// PR23. Sobre una búsqueda determinada (a elección de desarrollador), comprar
	// una oferta que deja un saldo positivo en el contador del comprobador.
	// Y comprobar que el contador se actualiza correctamente en la vista del
	// comprador.
	@Test
	public void PR23() {
		PO_HomeView.clickOption(driver, "identificarse", "class", "btn btn-primary");
		PO_LoginView.fillForm(driver, "user1@gmail.com", "123456");

		List<WebElement> elementos = PO_View.checkElement(driver, "free", "//li[contains(@id,'mCompras')]/a");
		elementos.get(0).click();
		elementos = PO_View.checkElement(driver, "free", "//a[contains(@href, 'compra/buscar')]");
		elementos.get(0).click();
		PO_SearchOfferView.fillForm(driver, "Mi Smart Band 4");

		elementos = PO_View.checkElement(driver, "free",
				"//td/following-sibling::*/a[contains(@href, 'compra/comprar')]");
		elementos.get(0).click();
		PO_View.checkElement(driver, "text", "62");
	}

	// PR24. Sobre una búsqueda determinada (a elección de desarrollador), comprar
	// una oferta que deja un saldo 0 en el contador del comprobador. Y comprobar
	// que el contador se actualiza correctamente en la vista del comprador.
	@Test
	public void PR24() {
		PO_HomeView.clickOption(driver, "identificarse", "class", "btn btn-primary");
		PO_LoginView.fillForm(driver, "user1@gmail.com", "123456");

		List<WebElement> elementos = PO_View.checkElement(driver, "free", "//li[contains(@id,'mCompras')]/a");
		elementos.get(0).click();
		elementos = PO_View.checkElement(driver, "free", "//a[contains(@href, 'compra/buscar')]");
		elementos.get(0).click();
		PO_SearchOfferView.fillForm(driver, "Xiaomi Redmi 7A Matte Blue");

		elementos = PO_View.checkElement(driver, "free",
				"//td/following-sibling::*/a[contains(@href, 'compra/comprar')]");
		elementos.get(0).click();
		PO_View.checkElement(driver, "text", "0€");
	}

	// PR25. Sobre una búsqueda determinada (a elección de desarrollador), intentar
	// comprar una oferta que esté por encima de saldo disponible del comprador.
	// Y comprobar que se muestra el mensaje de saldo no suficiente.
	@Test
	public void PR25() {
		PO_HomeView.clickOption(driver, "identificarse", "class", "btn btn-primary");
		PO_LoginView.fillForm(driver, "user1@gmail.com", "123456");

		List<WebElement> elementos = PO_View.checkElement(driver, "free", "//li[contains(@id,'mCompras')]/a");
		elementos.get(0).click();
		elementos = PO_View.checkElement(driver, "free", "//a[contains(@href, 'compra/buscar')]");
		elementos.get(0).click();
		PO_SearchOfferView.fillForm(driver, "PlayStation 4");

		elementos = PO_View.checkElement(driver, "free",
				"//td/following-sibling::*/a[contains(@href, 'compra/comprar')]");
		elementos.get(0).click();

		// PO_View.checkKey(driver, "Error.money", PO_Properties.getSPANISH());
		PO_View.checkElement(driver, "class", "alert alert-danger");
	}

	// PR26. Ir a la opción de ofertas compradas del usuario y mostrar la lista.
	// Comprobar que aparecen las ofertas que deben aparecer.
	@Test
	public void PR26() {
		PO_HomeView.clickOption(driver, "identificarse", "class", "btn btn-primary");
		PO_LoginView.fillForm(driver, "user1@gmail.com", "123456");

		List<WebElement> elementos = PO_View.checkElement(driver, "free", "//li[contains(@id,'mCompras')]/a");
		elementos.get(0).click();
		elementos = PO_View.checkElement(driver, "free", "//a[contains(@href, 'compra/lista')]");
		elementos.get(0).click();

		PO_View.checkElement(driver, "text", "Chromecast");
		PO_View.checkElement(driver, "text", "Zapatos de montaña");
	}

	// PR27. Sin hacer /
	@Test
	public void PR27() {
		
		assertTrue("PR27 sin hacer", false);
	}

	// PR029. Sin hacer /
	@Test
	public void PR29() {
		assertTrue("PR29 sin hacer", false);
	}

	// PR030. Inicio de sesión con datos válidos.
	@Test
	public void PR30() {
		driver.navigate().to(URL + "/cliente.html");
		PO_LoginView.fillForm(driver, "user1@gmail.com", "123456");	
		PO_View.checkElement(driver, "id", "tablaCuerpo");
	}

	// PR031. Inicio de sesión con datos inválidos (email existente, pero contraseña
	// incorrecta).
	@Test
	public void PR31() {
		driver.navigate().to(URL + "/cliente.html");
		PO_LoginView.fillForm(driver, "user1@gmail.com", "123");	
		PO_View.checkElement(driver, "text", "Email o contraseña incorrectos");
	}

	// PR032. Inicio de sesión con datos válidos (campo email o contraseña vacíos).
	@Test
	public void PR32() {
		driver.navigate().to(URL + "/cliente.html");
		PO_LoginView.fillForm(driver, "", "123");	
		PO_View.checkElement(driver, "text", "El campo email no puede ser vacio.");
		
		PO_LoginView.fillForm(driver, "user1@gmail.com", "");	
		PO_View.checkElement(driver, "text", "El campo contraseña no puede ser vacio");
	}

	// PR033. Mostrar el listado de ofertas disponibles y comprobar que se muestran todas las que existen, menos las del usuario identificado.
	@Test
	public void PR33() {
		driver.navigate().to(URL + "/cliente.html");
		PO_LoginView.fillForm(driver, "user1@gmail.com", "123456");	
		List<WebElement> elementos = SeleniumUtils.EsperaCargaPagina(driver, "free", "//tbody/tr",
				PO_View.getTimeout());
		
		assertTrue(elementos.size() == 12);
		
	}

	// PR034. Sobre una búsqueda determinada de ofertas (a elección de desarrollador), enviar un mensaje a una oferta concreta. Se abriría dicha 
	//conversación por primera vez. Comprobar que el mensaje aparece en el listado de mensajes.
	@Test
	public void PR34() {
		driver.navigate().to(URL + "/cliente.html");
		PO_LoginView.fillForm(driver, "user1@gmail.com", "123456");	
		List<WebElement> elementos = SeleniumUtils.EsperaCargaPagina(driver, "free", "//tbody/tr",
				PO_View.getTimeout());
		
		elementos = PO_View.checkElement(driver, "id", "chathref");
		elementos.get(0).click();
		PO_AddMessageView.fillForm(driver, "Prueba");
		elementos = SeleniumUtils.EsperaCargaPagina(driver, "free", "//tbody/tr",
				PO_View.getTimeout());
		assertTrue(elementos.size() == 1);
		
		
		
	}

	// PR035. Sobre el listado de conversaciones enviar un mensaje a una conversación ya abierta. Comprobar que el mensaje aparece en el listado de mensajes.
	@Test
	public void PR35() {
		driver.navigate().to(URL + "/cliente.html");
		PO_LoginView.fillForm(driver, "user1@gmail.com", "123456");	
		List<WebElement> elementos = SeleniumUtils.EsperaCargaPagina(driver, "free", "//tbody/tr",
				PO_View.getTimeout());
		PO_OfferChatListView.fillForm(driver, "PlayStation 4");
		
		
		elementos = PO_View.checkElement(driver, "id", "chathref");
		elementos.get(0).click();
		elementos = SeleniumUtils.EsperaCargaPagina(driver, "free", "//tbody/tr",
				PO_View.getTimeout());
		assertTrue(elementos.size() == 4);
		elementos = SeleniumUtils.EsperaCargaPagina(driver, "free", "//tbody/tr",
				PO_View.getTimeout());
		PO_AddMessageView.fillForm(driver, "Prueba1");
		PO_AddMessageView.fillForm(driver, "Prueba2");
		PO_AddMessageView.fillForm(driver, "Prueba3");
		PO_AddMessageView.fillForm(driver, "Prueba4");
		
		elementos = SeleniumUtils.EsperaCargaPagina(driver, "free", "//tbody/tr",
				PO_View.getTimeout());
		
		assertTrue(elementos.get(4).getText().equals("Prueba1 user1@gmail.com"));
		assertTrue(elementos.get(5).getText().equals("Prueba2 user1@gmail.com"));
		assertTrue(elementos.get(6).getText().equals("Prueba3 user1@gmail.com"));
		assertTrue(elementos.get(7).getText().equals("Prueba4 user1@gmail.com"));
		
		assertTrue(elementos.size() == 8);
	}

}
