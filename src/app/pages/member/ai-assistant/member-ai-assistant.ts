import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CardModule } from 'primeng/card';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { AiAssistantService, ChatMessage } from '@/services/ai-assistant.service';
import { MemberContextService } from '@/services/member-context.service';

@Component({
    selector: 'app-member-ai-assistant',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ButtonModule,
        InputTextModule,
        CardModule,
        ScrollPanelModule
    ],
    template: `
        <div class="card flex flex-col">
            <!-- Header -->
            <div class="mb-4">
                <div class="flex justify-between items-start mb-2">
                    <div>
                        <h2 class="text-2xl font-bold text-surface-900 dark:text-surface-0 mb-1">AI Assistant</h2>
                        <p class="text-surface-600 dark:text-surface-400 text-sm">
                            Ask questions about {{ memberName }}'s eligibility, programs, and health information
                        </p>
                    </div>
                    <button 
                        pButton 
                        icon="pi pi-trash" 
                        label="Clear Chat"
                        severity="secondary"
                        [outlined]="true"
                        size="small"
                        (click)="clearChat()"
                        [disabled]="messages.length === 0"
                    ></button>
                </div>
                
                <!-- Quick Actions -->
                <div class="flex flex-wrap gap-2 mt-4">
                    <button 
                        pButton 
                        label="Why not enrolled?"
                        icon="pi pi-question-circle"
                        size="small"
                        severity="secondary"
                        [outlined]="true"
                        (click)="askQuickQuestion('Why wasn\\'t this member enrolled in any programs?')"
                    ></button>
                    <button 
                        pButton 
                        label="Show eligible programs"
                        icon="pi pi-list-check"
                        size="small"
                        severity="secondary"
                        [outlined]="true"
                        (click)="askQuickQuestion('What programs is this member eligible for?')"
                    ></button>
                    <button 
                        pButton 
                        label="Check diabetes eligibility"
                        icon="pi pi-heart"
                        size="small"
                        severity="secondary"
                        [outlined]="true"
                        (click)="askQuickQuestion('Is this member eligible for Diabetes Care Management?')"
                    ></button>
                </div>
            </div>

            <!-- Chat Messages -->
            <div class="mb-4 border border-surface-200 dark:border-surface-700 rounded-lg overflow-hidden">
                <div class="h-[600px] overflow-y-auto p-4 bg-surface-50 dark:bg-surface-800" #chatContainer>
                    <!-- Welcome Message -->
                    <div *ngIf="messages.length === 0" class="text-center py-6">
                        <i class="pi pi-comments text-4xl text-primary mb-3"></i>
                        <h3 class="text-lg font-semibold text-surface-900 dark:text-surface-0 mb-2">
                            Welcome to AI Assistant
                        </h3>
                        <p class="text-surface-600 dark:text-surface-400 mb-3 text-sm">
                            I can help you understand {{ memberName }}'s eligibility and enrollment status
                        </p>
                        <div class="text-left max-w-md mx-auto text-xs text-surface-600 dark:text-surface-400">
                            <p class="font-semibold mb-1">Try asking:</p>
                            <ul class="space-y-0.5">
                                <li>• Why wasn't this member enrolled in Diabetes Care?</li>
                                <li>• What programs is this member eligible for?</li>
                                <li>• What are their current diagnoses?</li>
                                <li>• Show me their medications</li>
                                <li>• What are their recent lab results?</li>
                            </ul>
                        </div>
                    </div>

                    <!-- Messages -->
                    <div *ngFor="let message of messages" 
                         class="mb-4 flex"
                         [ngClass]="message.role === 'user' ? 'justify-end' : 'justify-start'">
                        <div class="max-w-[80%]">
                            <div class="flex items-start gap-2"
                                 [ngClass]="message.role === 'user' ? 'flex-row-reverse' : 'flex-row'">
                                <!-- Avatar -->
                                <div class="flex-shrink-0">
                                    <div class="w-8 h-8 rounded-full flex items-center justify-center"
                                         [ngClass]="message.role === 'user' 
                                             ? 'bg-primary text-primary-contrast' 
                                             : 'bg-surface-200 dark:bg-surface-700'">
                                        <i [class]="message.role === 'user' ? 'pi pi-user' : 'pi pi-sparkles'"></i>
                                    </div>
                                </div>
                                
                                <!-- Message Content -->
                                <div>
                                    <div class="px-4 py-3 rounded-lg"
                                         [ngClass]="message.role === 'user' 
                                             ? 'bg-primary text-primary-contrast' 
                                             : 'bg-surface-0 dark:bg-surface-900 border border-surface-200 dark:border-surface-700'">
                                        <div class="whitespace-pre-wrap break-words"
                                             [innerHTML]="formatMessage(message.content)">
                                        </div>
                                    </div>
                                    <div class="text-xs text-surface-500 dark:text-surface-400 mt-1 px-2"
                                         [ngClass]="message.role === 'user' ? 'text-right' : 'text-left'">
                                        {{ message.timestamp | date:'short' }}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Loading Indicator -->
                    <div *ngIf="isLoading" class="mb-4 flex justify-start">
                        <div class="max-w-[80%]">
                            <div class="flex items-start gap-2">
                                <div class="flex-shrink-0">
                                    <div class="w-8 h-8 rounded-full flex items-center justify-center bg-surface-200 dark:bg-surface-700">
                                        <i class="pi pi-sparkles"></i>
                                    </div>
                                </div>
                                <div class="px-4 py-3 rounded-lg bg-surface-0 dark:bg-surface-900 border border-surface-200 dark:border-surface-700">
                                    <div class="flex items-center gap-2">
                                        <i class="pi pi-spin pi-spinner"></i>
                                        <span class="text-surface-600 dark:text-surface-400">Thinking...</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Input Area -->
            <div class="flex gap-2">
                <input 
                    type="text" 
                    pInputText 
                    [(ngModel)]="userInput"
                    placeholder="Ask a question about this member..."
                    class="flex-1"
                    (keyup.enter)="sendMessage()"
                    [disabled]="isLoading"
                />
                <button 
                    pButton 
                    icon="pi pi-send" 
                    [loading]="isLoading"
                    (click)="sendMessage()"
                    [disabled]="!userInput.trim() || isLoading"
                ></button>
            </div>

            <!-- Member Context Info -->
            <div class="mt-4 p-3 bg-surface-100 dark:bg-surface-800 rounded text-xs text-surface-600 dark:text-surface-400">
                <div class="flex items-start gap-2">
                    <i class="pi pi-info-circle mt-0.5"></i>
                    <div>
                        <span class="font-semibold">AI Context:</span> This assistant has access to {{ memberName }}'s 
                        demographics, diagnoses, medications, lab results, claims, and program enrollment data.
                    </div>
                </div>
            </div>
        </div>
    `,
    styles: [`
        :host ::ng-deep {
            .p-scrollpanel {
                height: 600px;
            }
        }
    `]
})
export class MemberAiAssistant implements OnInit, OnDestroy {
    @ViewChild('chatContainer') private chatContainer!: ElementRef;
    
    memberId: string = '';
    memberName: string = 'this member';
    userInput: string = '';
    messages: ChatMessage[] = [];
    isLoading: boolean = false;

    constructor(
        private route: ActivatedRoute,
        private aiService: AiAssistantService,
        private memberContextService: MemberContextService
    ) {}

    ngOnInit(): void {
        this.route.parent?.params.subscribe(params => {
            this.memberId = params['id'];
            this.loadMemberInfo();
            this.loadChatHistory();
        });
    }

    ngOnDestroy(): void {
        // Session-based: history will be cleared when component is destroyed
    }

    loadMemberInfo(): void {
        const context = this.memberContextService.getMemberContext(this.memberId);
        this.memberName = context.name || 'this member';
    }

    loadChatHistory(): void {
        this.messages = this.aiService.getChatHistory(this.memberId);
    }

    sendMessage(): void {
        if (!this.userInput.trim() || this.isLoading) {
            return;
        }

        const message = this.userInput.trim();
        this.userInput = '';
        
        // Add user message
        const userMessage: ChatMessage = {
            id: `user-${Date.now()}`,
            role: 'user',
            content: message,
            timestamp: new Date()
        };
        this.messages.push(userMessage);
        this.scrollToBottom();

        // Get AI response
        this.isLoading = true;
        this.aiService.sendMessage(this.memberId, message).subscribe({
            next: (response) => {
                this.messages.push(response);
                this.isLoading = false;
                this.scrollToBottom();
            },
            error: (error) => {
                console.error('Error getting AI response:', error);
                this.isLoading = false;
            }
        });
    }

    askQuickQuestion(question: string): void {
        this.userInput = question;
        this.sendMessage();
    }

    clearChat(): void {
        this.aiService.clearHistory(this.memberId);
        this.messages = [];
    }

    formatMessage(content: string): string {
        // Convert markdown-style formatting to HTML
        let formatted = content
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')  // Bold
            .replace(/\*(.+?)\*/g, '<em>$1</em>')  // Italic
            .replace(/\n/g, '<br>')  // Line breaks
            .replace(/✅/g, '<span style="color: #22c55e;">✅</span>')  // Green checkmarks
            .replace(/❌/g, '<span style="color: #ef4444;">❌</span>')  // Red X
            .replace(/⚠️/g, '<span style="color: #f59e0b;">⚠️</span>');  // Warning
        
        return formatted;
    }

    scrollToBottom(): void {
        setTimeout(() => {
            if (this.chatContainer) {
                const element = this.chatContainer.nativeElement;
                element.scrollTop = element.scrollHeight;
            }
        }, 100);
    }
}

