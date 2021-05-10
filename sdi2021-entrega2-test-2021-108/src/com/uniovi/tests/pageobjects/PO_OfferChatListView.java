package com.uniovi.tests.pageobjects;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

public class PO_OfferChatListView extends PO_NavView {
	static public void fillForm(WebDriver driver, String seaechp) {
		WebElement email = driver.findElement(By.name("busquedaTitulo"));
		email.click();
		email.clear();
		email.sendKeys(seaechp);
	}

}