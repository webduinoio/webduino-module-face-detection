Blockly.Blocks['facedetect_pico_show_square'] = {
  init: function() {
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([
          [Blockly.Msg.FaceDetectPico_SQUARE_SHOW, "true"],
          [Blockly.Msg.FaceDetectPico_SQUARE_HIDDEN, "false"]
        ]), "display")
        .appendField(Blockly.Msg.FaceDetectPico)
        .appendField(Blockly.Msg.FaceDetectPico_SQUARE_FINAL_TEXT);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(210);
    this.setTooltip("");
    this.setHelpUrl("");
  }
};

Blockly.Blocks['facedetect_pico_set_opacity'] = {
  init: function() {
    this.appendDummyInput()
        .appendField(Blockly.Msg.FaceDetectPico_SET)
        .appendField(Blockly.Msg.FaceDetectPico);
    this.appendValueInput("OPACITY")
        .setCheck(null)
        .appendField(Blockly.Msg.FaceDetectPico_OPACITY);
    this.appendDummyInput()
        .appendField("(0~100)");
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(230);
    this.setTooltip("");
    this.setHelpUrl("");
  }
};

Blockly.Blocks['facedetect_pico_get_count'] = {
  init: function() {
    this.appendDummyInput()
        .appendField(Blockly.Msg.FaceDetectPico_COUNT_FACE);
    this.setOutput(true, null);
    this.setColour(230);
    this.setTooltip("");
    this.setHelpUrl("");
  }
};

Blockly.Blocks['facedetect_pico_get_value'] = {
  init: function() {
    this.appendValueInput("INDEX")
        .setCheck(null)
        .appendField(Blockly.Msg.FaceDetectPico_VALUES_TEXT1);
    this.appendDummyInput()
        .appendField(Blockly.Msg.FaceDetectPico_VALUES_TEXT2)
        .appendField(new Blockly.FieldDropdown([
          [Blockly.Msg.FaceDetectPico_VALUES_X, "x"],
          [Blockly.Msg.FaceDetectPico_VALUES_Y, "y"],
          [Blockly.Msg.FaceDetectPico_VALUES_WIDTH, "width"],
          [Blockly.Msg.FaceDetectPico_VALUES_HEIGHT, "height"]
        ]), "props");
    this.setInputsInline(true);
    this.setOutput(true, null);
    this.setColour(230);
    this.setTooltip("");
    this.setHelpUrl("");
  }
};
