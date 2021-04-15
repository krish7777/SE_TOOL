from flask import Flask,request, jsonify 

from transformers import AutoTokenizer, AutoModelWithLMHead, SummarizationPipeline

pipeline = SummarizationPipeline(
    model=AutoModelWithLMHead.from_pretrained("SEBIS/code_trans_t5_base_code_documentation_generation_python"),
    tokenizer=AutoTokenizer.from_pretrained("SEBIS/code_trans_t5_base_code_documentation_generation_python", skip_special_tokens=True)
)

code = ""
from tree_sitter import Language, Parser

Language.build_library(
  'build/my-languages.so',
  ['tree-sitter-python']
)

PYTHON_LANGUAGE = Language('build/my-languages.so', 'python')
parser = Parser()
parser.set_language(PYTHON_LANGUAGE)

def get_string_from_code(node, lines):
  line_start = node.start_point[0]
  line_end = node.end_point[0]
  char_start = node.start_point[1]
  char_end = node.end_point[1]
  if line_start != line_end:
    code_list.append(' '.join([lines[line_start][char_start:]] + lines[line_start+1:line_end] + [lines[line_end][:char_end]]))
  else:
    code_list.append(lines[line_start][char_start:char_end])

def my_traverse(node, code_list):
  lines = code.split('\n')
  if node.child_count == 0:
    get_string_from_code(node, lines)
  elif node.type == 'string':
    get_string_from_code(node, lines)
  else:
    for n in node.children:
      my_traverse(n, code_list)
 
  return ' '.join(code_list)

# tree = parser.parse(bytes(code, "utf8"))
code_list=[]
# tokenized_code = my_traverse(tree.root_node, code_list)
# print("Output after tokenization: " + tokenized_code)


# out = pipeline([tokenized_code])



app = Flask(__name__)

@app.route('/summary', methods=['POST'])
def summary():
    if request.method == "POST":
        global code
        payload = request.get_json()
        code = payload["code"]
        tree = parser.parse(bytes(code, "utf8"))
        print("\ncode\n",code) 
        print("\ntree\n",tree)
        print("\n")
        tokenized_code = my_traverse(tree.root_node, code_list)
        out = pipeline([tokenized_code])
        print("output\n", out)
        # out = {"ds":"dss"}
        return jsonify(out)