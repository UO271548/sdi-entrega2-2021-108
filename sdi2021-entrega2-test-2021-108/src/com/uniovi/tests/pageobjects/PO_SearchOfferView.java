package com.uniovi.tests.pageobjects;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

public class PO_SearchOfferView extends PO_NavView {
	static public void fillForm(WebDriver driver, String seaechp) {
		WebElement email = driver.findElement(By.name("busqueda"));
		email.click();
		email.clear();
		email.sendKeys(seaechp);
		By boton = By.className("btn");
		driver.findElement(boton).click();
	}

}
