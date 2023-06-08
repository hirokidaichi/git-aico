# git-aico

The command that reads the difference and automatically generates a commit
message.


https://github.com/hirokidaichi/git-aico/assets/95184/6d3b9412-5d5c-4d24-9d64-3b7a620e2c1f



```
  Usage: git aico

  Description:

    The command that reads the difference and automatically generates a commit message.

  Options:

    -h, --help                      - Show this help.                                
    -m, --model        <modelName>  - The model name to use        (Default: "gpt-4")
    -t, --temperature  <temp>       - The temperature to use       (Default: 0.1)    
    --max-tokens       <maxToken>   - The max tokens to use        (Default: 500)    
    -p, --prompt       <prompt>     - The prompt file path to use
```
## Usage



## Install

```
deno install --allow-net --allow-read --allow-write --allow-env --allow-run --unstable -r -f -n git-aico https://raw.githubusercontent.com/hirokidaichi/git-aico/main/command.ts
```
