const getPossessiveNameForm = require("./js/utilities");

test("Possesive not ending with 's'.", () => {
    expect(getPossessiveNameForm("Clara")).toBe("Clara's");
});

test("Possesive ending with 's'.", () => {
    expect(getPossessiveNameForm("Cass")).toBe("Cass'");
});

test("Possesive ending with 'S'.", () => {
    expect(getPossessiveNameForm("CasS")).toBe("CasS'");
});

test("Possesive empty string.", () => {
    expect(getPossessiveNameForm("")).toBe("");
});

test("Possesive not a string.", () => {
    expect(getPossessiveNameForm(57)).toBe("");
});
