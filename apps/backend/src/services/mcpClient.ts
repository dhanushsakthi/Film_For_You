import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { ListToolsResultSchema, CallToolResultSchema } from "@modelcontextprotocol/sdk/types.js";
import path from "path";

export class McpClient {
    private client: Client;
    private transport: StdioClientTransport;

    constructor() {
        const serverPath = path.resolve(__dirname, "../../../mcp-server/src/index.ts");

        this.transport = new StdioClientTransport({
            command: "npx",
            args: ["ts-node", serverPath],
        });

        this.client = new Client(
            {
                name: "movie-discovery-client",
                version: "1.0.0",
            },
            {
                capabilities: {
                    tools: {},
                },
            }
        );
    }

    async connect() {
        try {
            await this.client.connect(this.transport);
            console.log("Connected to MCP Movie Server");
        } catch (error) {
            console.error("Failed to connect to MCP Server:", error);
            throw error;
        }
    }

    async listTools() {
        return await this.client.request(
            { method: "tools/list" },
            ListToolsResultSchema
        );
    }

    async callTool(name: string, args: any) {
        return await this.client.request(
            {
                method: "tools/call",
                params: {
                    name,
                    arguments: args,
                },
            },
            CallToolResultSchema
        );
    }
}

export const mcpClient = new McpClient();
